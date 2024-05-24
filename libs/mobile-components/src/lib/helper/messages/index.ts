import { ApiMessageAttachment } from 'mezon-js/dist/api.gen';

export function abbreviateText(filename: string) {
	// Split the filename and extension
	const parts = filename.split('.');
	const extension = parts.pop();
	let baseName = parts.join('.');

	// Split the base name into parts by underscores or spaces
	const baseNameParts = baseName.split(/[_\s]+/);

	// Abbreviate the parts according to the examples given
	if (baseNameParts.length > 2) {
		baseName = baseNameParts[0] + '...' + baseNameParts[baseNameParts.length - 1];
	} else if (baseNameParts.length == 2) {
		baseName = baseNameParts[0] + '...' + baseNameParts[1];
	}

	// Recombine the base name and extension
	return baseName + '.' + extension;
}

export function getAttachmentUnique(attachments: ApiMessageAttachment[]) {
	return Object.values(
		attachments.reduce((acc: any, cur: any) => {
			if (!acc[cur.filename] || cur.size) {
				acc[cur.filename] = cur;
			}
			return acc;
		}, {}),
	);
}
