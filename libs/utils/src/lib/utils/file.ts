function createFileMetadata<T>(file: File): T {
	return {
		filename: file.name,
		filetype: file.type,
		size: file.size,
		url: URL.createObjectURL(file)
	} as T;
}

function processNonMediaFile<T>(file: File): Promise<T> {
	return Promise.resolve(createFileMetadata(file));
}

function processVideoFile<T>(file: File): Promise<T> {
	return new Promise((resolve) => {
		const video = document.createElement('video');
		video.onloadedmetadata = () => {
			resolve({
				...createFileMetadata(file),
				width: video.videoWidth,
				height: video.videoHeight
			} as T);
			URL.revokeObjectURL(video.src);
		};
		video.onerror = () => {
			URL.revokeObjectURL(video.src);
		};
		video.src = URL.createObjectURL(file);
	});
}

function processImageFile<T>(file: File): Promise<T> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				resolve({
					...createFileMetadata(file),
					width: img.width,
					height: img.height
				} as T);
				URL.revokeObjectURL(img.src);
			};
			img.onerror = () => {
				URL.revokeObjectURL(img.src);
			};
			if (event.target?.result) {
				img.src = event.target.result as string;
			}
		};
		reader.readAsDataURL(file);
	});
}

export function processFile<T>(file: File): Promise<T> {
	if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
		return processNonMediaFile(file);
	}

	if (file.type.startsWith('video/')) {
		return processVideoFile(file);
	}

	return processImageFile(file);
}
