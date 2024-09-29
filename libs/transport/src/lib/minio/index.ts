import { Buffer as BufferMobile } from 'buffer';
import { Client, Session } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';

export const isValidUrl = (urlString: string) => {
	let url;
	try {
		url = new URL(urlString);
	} catch (e) {
		return false;
	}
	return url.protocol === 'https:';
};

export function uploadImageToMinIO(url: string, stream: Buffer, size: number) {
	return fetch(url, { method: 'PUT', body: stream });
}

export function uploadImageToMinIOMobile(url: string, stream: Buffer, type: string, size: number) {
	// Add header to upload success on mobile
	return fetch(url, {
		method: 'PUT',
		body: stream,
		headers: {
			'Content-Type': type,
			'Content-Length': size?.toString() || '1000'
		}
	});
}

export async function handleUploadEmoticon(client: Client, session: Session, filename: string, file: File): Promise<ApiMessageAttachment> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
		try {
			let fileType = file.type;
			if (!fileType) {
				const fileNameParts = file.name.split('.');
				const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
				fileType = `text/${fileExtension}`;
			}

			const buf = await file?.arrayBuffer();

			resolve(uploadFile(client, session, filename, fileType, file.size, Buffer.from(buf)));
		} catch (error) {
			reject(new Error(`${error}`));
		}
	});
}
const mimeTypeMap: Record<string, string> = {
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx'
};

function getFileType(mimeType: string): string {
	return mimeTypeMap[mimeType] || mimeType;
}

export async function handleUploadFile(
	client: Client,
	session: Session,
	currentClanId: string,
	currentChannelId: string,
	filename: string,
	file: File,
	index?: number
): Promise<ApiMessageAttachment> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
		try {
			let fileType = file.type;
			if (!fileType) {
				const fileNameParts = file.name.split('.');
				const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
				fileType = `text/${fileExtension}`;
			}
			const shortFileType = getFileType(fileType);

			const { filePath, originalFilename } = createUploadFilePath(session, currentClanId, currentChannelId, filename, false, index);
			const buf = await file?.arrayBuffer();

			resolve(uploadFile(client, session, filePath, shortFileType, file.size, Buffer.from(buf), false, originalFilename));
		} catch (error) {
			reject(new Error(`${error}`));
		}
	});
}

export async function handleUploadFileMobile(
	client: Client,
	session: Session,
	currentClanId: string,
	currentChannelId: string,
	filename: string,
	file: any
): Promise<ApiMessageAttachment> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
		try {
			let fileType = file.type;
			if (!fileType) {
				const fileNameParts = file.name.split('.');
				const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
				fileType = `text/${fileExtension}`;
			}
			if (file?.uri) {
				const arrayBuffer = BufferMobile.from(file.fileData, 'base64');
				if (!arrayBuffer) {
					console.log('Failed to read file data.');
					return;
				}
				const { filePath, originalFilename } = createUploadFilePath(session, currentClanId, currentChannelId, filename, true);
				resolve(uploadFile(client, session, filePath, fileType, file.size, arrayBuffer, true, originalFilename));
			}
		} catch (error) {
			console.log('handleUploadFileMobile Error: ', error);
			reject(new Error(`${error}`));
		}
	});
}

export function createUploadFilePath(
	session: Session,
	currentClanId: string,
	currentChannelId: string,
	filename: string,
	isMobile: boolean,
	index?: number
): { filePath: string; originalFilename: string } {
	const originalFilename = filename;
	// Append milliseconds timestamp to filename
	const ms = new Date().getMilliseconds();
	filename = isMobile ? ms + filename : ms + '_' + index + filename;
	filename = filename.replace(/[^a-zA-Z0-9.]/g, '_');
	// Ensure valid clan and channel IDs
	if (!currentClanId) {
		currentClanId = '0';
	}
	if (!currentChannelId) {
		currentChannelId = '0';
	}
	const filePath = `${currentClanId}/${currentChannelId}/${session.user_id}/${filename}`;
	return { filePath, originalFilename };
}

export async function uploadFile(
	client: Client,
	session: Session,
	filename: string,
	type: string,
	size: number,
	buf: Buffer,
	isMobile?: boolean,
	originalFilename?: string
): Promise<ApiMessageAttachment> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
		try {
			const data = await client.uploadAttachmentFile(session, {
				filename: filename,
				filetype: type,
				size: size
			});
			if (!data?.url) {
				reject(new Error('Failed to upload file. URL not available.'));
				return;
			}
			const res = await (isMobile ? uploadImageToMinIOMobile(data.url || '', buf, type, size) : uploadImageToMinIO(data.url || '', buf, size));
			if (res.status !== 200) {
				throw new Error('Failed to upload file to MinIO.');
			}
			const url = 'https://cdn.mezon.vn/' + filename;
			resolve({
				filename: originalFilename,
				url: url,
				filetype: type,
				size: size,
				width: 0,
				height: 0
			});
		} catch (error) {
			reject(new Error(`${error}`));
		}
	});
}
