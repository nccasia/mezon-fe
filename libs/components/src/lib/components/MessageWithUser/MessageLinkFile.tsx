import { Icons } from '@mezon/ui';
import { EFailAttachment } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useState } from 'react';
import { RenderAttachmentThumbnail } from '../../components';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
	readonly mode?: ChannelStreamMode;
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

function MessageLinkFile({ attachmentData, mode }: MessageImage) {
	const handleDownload = async () => {
		// window.open(attachmentData.);
		const response = await fetch(attachmentData.url as string);
		if (!response.ok) {
			return;
		}
		const blob = await response.blob();
		const dataUrl = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = dataUrl;
		a.download = attachmentData.filename as string;
		a.click();
	};
	const thumbnailAttachment = RenderAttachmentThumbnail(attachmentData, 'w-8 h-10');

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
			className={`break-all w-full cursor-default gap-3 flex mt-[10px] py-3 pl-3 pr-3 rounded max-w-full ${hideTheInformationFile ? 'dark:border-[#232428] dark:bg-[#2B2D31] bg-white border-2' : ''}  relative`}
			role="button"
		>
			<div className="flex items-center">{thumbnailAttachment}</div>
			{attachmentData.filename === EFailAttachment.FAIL_ATTACHMENT ? (
				<div className="text-red-500">Attachment failed to load.</div>
			) : (
				hideTheInformationFile && (
					<>
						<div className="cursor-pointer" onClick={handleDownload} onKeyDown={handleDownload}>
							<p className="text-blue-500 hover:underline">{attachmentData.filename}</p>
							<p className="dark:text-textDarkTheme text-textLightTheme">size: {formatFileSize(attachmentData.size || 0)}</p>
						</div>
						{hoverShowOptButtonStatus && (
							<div className="h-8 absolute right-[-0.6rem] top-[-0.5rem] w-16 rounded-md dark:bg-[#313338] border dark:border-0 bg-gray-200 flex flex-row justify-center items-center">
								<div
									onClick={handleDownload}
									role="button"
									className="rounded-l-md w-8 h-8 flex flex-row justify-center items-center cursor-pointer dark:hover:bg-[#393C40] hover:bg-gray-300"
								>
									<Icons.Download defaultSize="w-4 h-4" />
								</div>
								<div className={`rounded-r-md w-8 h-8 flex flex-row justify-center items-center cursor-pointer hover:bg-[#E13542]`}>
									<Icons.TrashIcon className="w-4 h-4" />
								</div>
							</div>
						)}
					</>
				)
			)}
		</div>
	);
}

export default MessageLinkFile;
