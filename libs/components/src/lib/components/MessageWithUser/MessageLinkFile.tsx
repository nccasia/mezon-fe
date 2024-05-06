import { RenderAttachmentThumbnail } from '@mezon/ui';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useState } from 'react';
import { Icons } from '../../components';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
};
function formatFileSize(bytes: number) {
	if (bytes >= 1000000) {
		return (bytes / 1000000).toFixed(1) + ' MB';
	} else if (bytes >= 1000) {
		return (bytes / 1000).toFixed(1) + ' kB';
	} else {
		return bytes + ' bytes';
	}
}

function MessageLinkFile({ attachmentData }: MessageImage) {
	const handleDownload = () => {
		window.open(attachmentData.url);
	};
	const thumbnailAttachment = RenderAttachmentThumbnail(attachmentData, 'w-12 h-12');

	const hideTheInformationFile =
		attachmentData.filetype !== 'image/gif' &&
		attachmentData.filetype !== 'image/png' &&
		attachmentData.filetype !== 'image/jpeg' &&
		attachmentData.filetype !== 'video/mp4';

	const [hoverShowOptButtonStatus, setHoverShowOptButtonStatus] = useState(false);
	const hoverOptButton = () => {
		setHoverShowOptButtonStatus(true);
	};

	return (
		<div
			onMouseEnter={hoverOptButton}
			onMouseLeave={() => setHoverShowOptButtonStatus(false)}
			className={`break-all cursor-default gap-3 flex mt-[10px] py-3 pl-3 pr-20 rounded  ${hideTheInformationFile ? 'border-[#232428] bg-[#2B2D31] border border-2' : ''}  relative`} role='button'
		>
			<div>{thumbnailAttachment}</div>
			{hideTheInformationFile && (
				<div className=" cursor-pointer " onClick={handleDownload} onKeyDown={handleDownload}>
					<p className="text-blue-500 hover:underline">{attachmentData.filename}</p>
					<p>size: {formatFileSize(attachmentData.size || 0)}</p>
				</div>
			)}
			{hideTheInformationFile && hoverShowOptButtonStatus && (
				<div className="h-8 absolute right-[-0.6rem] top-[-0.5rem] w-16 rounded-md bg-[#313338] flex flex-row justify-center items-center">
					<div
						onClick={handleDownload}
						role='button'
						className="rounded-l-md  w-8 h-8 flex flex-row justify-center items-center cursor-pointer hover:bg-[#393C40]"
					>
						<Icons.Download defaultSize="w-4 h-4" />
					</div>
					<div className={` rounded-r-md w-8 h-8 flex flex-row justify-center items-center cursor-pointer hover:bg-[#E13542]`}>
						<Icons.TrashIcon defaultSize="w-4 h-4" />
					</div>
				</div>
			)}
		</div>
	);
}

export default MessageLinkFile;
