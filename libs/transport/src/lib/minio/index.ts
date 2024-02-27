import * as minio from "minio";
import { UploadedObjectInfo } from "minio";
import { ItemBucketMetadata, ResultCallback } from "minio/dist/main/internal/type";

let clientInstance: minio.Client;

export function getMinIoClient() {
	return clientInstance;
}

export function createMinIoClient() {
	// TODO: hide it
	const options = {
		endPoint: 'minio-api.mezon.vn',
		port: 9002,
		useSSL: true,
		accessKey: 'RqYFpw0saC8hvabCpu8A',
		secretKey: '5NUOCq60NkGQk4JIkvl6YYk8tQ0QaMeUDEVfahVT'
	}
	const client = new minio.Client(options);
	clientInstance = client;

	return client;
}

export function uploadImageToMinIO(bucket: string, name: string, 
		stream: Buffer,
		size: number, 
		metaData: ItemBucketMetadata,
		callback: ResultCallback<UploadedObjectInfo>) {
	if (!clientInstance) {
		createMinIoClient();
	}

	clientInstance.putObject(bucket, name, stream, size, metaData, callback);
}
