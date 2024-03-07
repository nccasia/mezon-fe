import { Session } from "vendors/mezon-js/packages/mezon-js/dist";
import { ApiMessageAttachment } from "vendors/mezon-js/packages/mezon-js/dist/api.gen";
import { Client } from "@mezon/mezon-js";

const isValidUrl = (urlString: string) => {
	let url;
	try { 
		url =new URL(urlString); 
	} catch(e) { 
		return false; 
	}
	return url.protocol === "https:";
}

export function uploadImageToMinIO(url: string, stream: Buffer, size: number) {
	return fetch(url, { method: 'PUT', body: stream });
}

export function handleUploadFile(client: Client, session: Session, 
	fullfilename: string, file: File): Promise<ApiMessageAttachment> {
	return new Promise<ApiMessageAttachment>(function(resolve, reject) {
		file?.arrayBuffer().then((buf) => {
			client.uploadAttachmentFile(session, {
				filename: fullfilename,
				filetype: file.type,
				size: file.size,
			}).then((data) => {
				if (!data || !data.url) {
					reject({});
				}				
				// upload to minio
				uploadImageToMinIO(data.url || '', Buffer.from(buf), file.size).then((res) => {
					if (res.status !== 200) {
						reject({});
					}
					const url = 'https://cdn.mezon.vn/' + fullfilename;
					resolve({
						filename: file.name,
						url: url,
						filetype: file.type,
						size: file.size,
						width: 0,
						height: 0,
					});
				});
			});
		});
	});
}

export function handleUrlInput(url: string) : Promise<ApiMessageAttachment> {
	return new Promise<ApiMessageAttachment>(function(resolve, reject) {
		// limit url within 512
		if (isValidUrl(url) === true && url.length < 512) {
			try {
				fetch(url, {method: 'HEAD'}).then(response => {
					const contentSize = response.headers.get('Content-Length');
					const contentType = response.headers.get('Content-Type');					
					if (contentType) {
						resolve({
							filename: url,
							url: url,
							filetype: contentType,
							size: Number(contentSize),
							width: 0,
							height: 0,
						});
					}
				}).catch(e => {
					reject({});
				});
			} catch(e) {
				reject({});
			}
		}
	});
}
