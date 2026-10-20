/// <reference lib="dom.asynciterable" />

import { getRecordingWindow, supportsDiskStreaming, supportsOriginPrivateFileSystem } from './capabilities';

export const BLOB_SINK_MAX_BYTES = 800 * 1024 * 1024;
export const BLOB_SINK_MAX_DURATION_MS = 30 * 60 * 1000;

export interface RecordingSink {
	readonly streaming: boolean;
	readonly fileName: string;
	readonly bytesWritten: number;
	write(chunk: Blob): Promise<void>;
	finalize(): Promise<{ savedToDisk: boolean; bytes: number }>;
	abort(): Promise<void>;
}

class FileSystemSink implements RecordingSink {
	readonly streaming = true;
	bytesWritten = 0;

	private queue: Promise<void> = Promise.resolve();
	private failed: Error | null = null;

	constructor(
		readonly fileName: string,
		private readonly writable: FileSystemWritableFileStream
	) {}

	write(chunk: Blob): Promise<void> {
		if (this.failed) return Promise.reject(this.failed);
		if (chunk.size === 0) return Promise.resolve();
		const write = this.queue.then(async () => {
			if (this.failed) throw this.failed;
			await this.writable.write(chunk);
			this.bytesWritten += chunk.size;
		});
		// Keep the queue settled while exposing failures to the recorder immediately.
		this.queue = write.catch((error: Error) => {
			this.failed = error;
		});
		return write;
	}

	async finalize() {
		await this.queue;
		if (this.failed) {
			await this.abort();
			throw this.failed;
		}
		try {
			await this.writable.close();
		} catch (error) {
			await this.abort();
			throw error;
		}
		return { savedToDisk: true, bytes: this.bytesWritten };
	}

	async abort(): Promise<void> {
		await this.queue;
		try {
			await this.writable.abort();
		} catch {
			/* stream already gone */
		}
	}
}

const OPFS_DIRECTORY = 'mezon-recordings';
const OPFS_FILE_PREFIX = '.mezon-recording-';
const OPFS_EXPORT_RETENTION_MS = 24 * 60 * 60 * 1000;

class OriginPrivateFileSystemSink extends FileSystemSink {
	constructor(
		fileName: string,
		writable: FileSystemWritableFileStream,
		private readonly handle: FileSystemFileHandle,
		private readonly directory: FileSystemDirectoryHandle
	) {
		super(fileName, writable);
	}

	async finalize() {
		const outcome = await super.finalize();
		try {
			const file = await this.handle.getFile();
			triggerDownload(URL.createObjectURL(file), this.fileName);
			window.setTimeout(() => void this.removeTemporaryFile(), OPFS_EXPORT_RETENTION_MS);
			return { ...outcome, savedToDisk: false };
		} catch (error) {
			await this.removeTemporaryFile();
			throw error;
		}
	}

	async abort(): Promise<void> {
		await super.abort();
		await this.removeTemporaryFile();
	}

	private async removeTemporaryFile(): Promise<void> {
		try {
			await this.directory.removeEntry(this.handle.name);
		} catch (error) {
			if ((error as DOMException)?.name !== 'NotFoundError') {
				console.warn('[recording] could not remove temporary recording', error);
			}
		}
	}
}

async function removeExpiredRecordings(directory: FileSystemDirectoryHandle): Promise<void> {
	try {
		if (typeof directory.entries !== 'function') return;
		const cutoff = Date.now() - OPFS_EXPORT_RETENTION_MS;
		for await (const [name, entry] of directory.entries()) {
			if (entry.kind !== 'file' || !name.startsWith(OPFS_FILE_PREFIX)) continue;
			const file = await (entry as FileSystemFileHandle).getFile();
			if (file.size > 0 && file.lastModified < cutoff) {
				await directory.removeEntry(name);
			}
		}
	} catch (error) {
		console.warn('[recording] could not clean expired recordings', error);
	}
}

class BlobSink implements RecordingSink {
	readonly streaming = false;
	bytesWritten = 0;

	private chunks: Blob[] = [];

	constructor(
		readonly fileName: string,
		private readonly mimeType: string
	) {}

	async write(chunk: Blob): Promise<void> {
		if (chunk.size === 0) return;
		this.chunks.push(chunk);
		this.bytesWritten += chunk.size;
	}

	async finalize() {
		const blob = new Blob(this.chunks, { type: this.mimeType });
		this.chunks = [];
		const bytes = blob.size;
		triggerDownload(URL.createObjectURL(blob), this.fileName);
		return { savedToDisk: false, bytes };
	}

	async abort(): Promise<void> {
		this.chunks = [];
	}
}

const DOWNLOAD_URL_TTL_MS = 60_000;

function triggerDownload(url: string, fileName: string): void {
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	anchor.rel = 'noopener';
	try {
		document.body.appendChild(anchor);
		anchor.click();
	} finally {
		anchor.remove();
		window.setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_TTL_MS);
	}
}

export class RecordingCancelledError extends Error {
	constructor() {
		super('recording-cancelled');
		this.name = 'RecordingCancelledError';
	}
}

export async function createRecordingSink(fileName: string, mimeType: string, extension: string): Promise<RecordingSink> {
	const win = getRecordingWindow();

	if (win && supportsDiskStreaming() && win.showSaveFilePicker) {
		try {
			const handle = await win.showSaveFilePicker({
				suggestedName: fileName,
				types: [
					{
						description: extension === 'mp4' ? 'MPEG-4 video' : 'WebM video',
						accept: { [mimeType.split(';')[0]]: [`.${extension}`] }
					}
				]
			});
			const writable = await handle.createWritable();
			return new FileSystemSink(handle.name || fileName, writable);
		} catch (error) {
			if ((error as DOMException)?.name === 'AbortError') {
				throw new RecordingCancelledError();
			}
			console.warn('[recording] save picker unavailable, trying browser storage instead', error);
		}
	}

	if (supportsOriginPrivateFileSystem()) {
		try {
			const root = await navigator.storage.getDirectory();
			const directory = await root.getDirectoryHandle(OPFS_DIRECTORY, { create: true });
			await removeExpiredRecordings(directory);
			const handle = await directory.getFileHandle(`${OPFS_FILE_PREFIX}${crypto.randomUUID()}`, { create: true });
			try {
				const writable = await handle.createWritable();
				return new OriginPrivateFileSystemSink(fileName, writable, handle, directory);
			} catch (error) {
				await directory.removeEntry(handle.name);
				throw error;
			}
		} catch (error) {
			console.warn('[recording] browser storage unavailable, buffering in memory instead', error);
		}
	}

	return new BlobSink(fileName, mimeType);
}

export function buildRecordingFileName(channelLabel: string | undefined, extension: string): string {
	const now = new Date();
	const pad = (value: number) => String(value).padStart(2, '0');
	const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
	const safeLabel = (channelLabel || 'call')
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.slice(0, 40);
	return `mezon-${safeLabel || 'call'}-${stamp}.${extension}`;
}
