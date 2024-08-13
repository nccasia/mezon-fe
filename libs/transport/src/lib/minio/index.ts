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
			'Content-Length': size?.toString() || '1000',
		},
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

export async function handleUploadFile(
	client: Client,
	session: Session,
	currentClanId: string,
	currentChannelId: string,
	filename: string,
	file: File,
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
			const fullfilename = createUploadFilePath(session, currentClanId, currentChannelId, filename);
			const buf = await file?.arrayBuffer();

			resolve(uploadFile(client, session, fullfilename, fileType, file.size, Buffer.from(buf)));
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
	file: any,
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
				const fullfilename = createUploadFilePath(session, currentClanId, currentChannelId, filename);
				resolve(uploadFile(client, session, fullfilename, fileType, file.size, arrayBuffer, true));
			}
		} catch (error) {
			console.log('handleUploadFileMobile Error: ', error);
			reject(new Error(`${error}`));
		}
	});
}

export function createUploadFilePath(session: Session, currentClanId: string, currentChannelId: string, filename: string): string {
	const ms = new Date().getMinutes();
	filename = ms + filename;
	filename = filename.replace(/-|\(|\)| /g, '_');
	if (!currentClanId) {
		currentClanId = '0';
	}
	return currentClanId + '/' + currentChannelId + '/' + session.user_id + '/' + filename;
}

export async function uploadFile(
	client: Client,
	session: Session,
	filename: string,
	type: string,
	size: number,
	buf: Buffer,
	isMobile?: boolean,
): Promise<ApiMessageAttachment> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
		try {
			const data = await client.uploadAttachmentFile(session, {
				filename: filename,
				filetype: type,
				size: size,
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
				filename: filename,
				url: url,
				filetype: type,
				size: size,
				width: 0,
				height: 0,
			});
		} catch (error) {
			reject(new Error(`${error}`));
		}
	});
}
interface ApiMessageAttachment2 {
	filename: string;
	url: string;
	filetype: string;
	size: number;
	width: number;
	height: number;
	title: string;
	description: string;
	image: string;
}

export function handleUrlInput(url: string): Promise<ApiMessageAttachment2> {
	const defaultAttachment: ApiMessageAttachment2 = {
		filename: '',
		url: '',
		filetype: '',
		size: 0,
		width: 0,
		height: 0,
		title: '',
		description: '',
		image: '',
	};

	return new Promise<ApiMessageAttachment2>((resolve, reject) => {
		if (isValidUrl(url) && url.length < 512) {
			// Fetching the headers first to check if the URL is valid
			fetch(url, { method: 'GET', mode: 'no-cors' })
				.then((response) => {
					if (response.ok) {
						const now = Date.now();
						const contentSize = response.headers.get('Content-Length');
						const contentType = response.headers.get('Content-Type');

						// Fetching the full content to extract metadata
						return fetch(url)
							.then((textResponse) => {
								if (textResponse.ok) {
									return textResponse.text();
								} else {
									throw new Error(`Error fetching text content. Status: ${textResponse.status}`);
								}
							})
							.then((textContent) => {
								const parser = new DOMParser();
								const doc = parser.parseFromString(textContent, 'text/html');

								// Extracting metadata from the HTML document
								const title = doc.querySelector('title')?.textContent || '';
								const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
								const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

								// Constructing the attachment object
								const size = Number(contentSize);
								resolve({
									filename: now + (contentType || 'unknown'),
									url: url,
									filetype: contentType || '',
									size: isNaN(size) ? 0 : size,
									width: 0,
									height: 0,
									title: title,
									description: description,
									image: image,
								});
							})
							.catch((error) => {
								console.error('Error processing HTML content:', error);
								resolve(defaultAttachment);
							});
					} else {
						console.error(`Error: Response not OK. Status: ${response.status}`);
						resolve(defaultAttachment);
					}
				})
				.catch((error) => {
					console.error('Error fetching URL:', error);
					resolve(defaultAttachment);
				});
		} else {
			resolve(defaultAttachment);
		}
	});
}
