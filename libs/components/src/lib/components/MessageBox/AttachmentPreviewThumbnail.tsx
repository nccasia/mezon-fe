import { Icons } from '@mezon/ui';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useState } from 'react';
import { RenderAttachmentThumbnail } from '../ThumbnailAttachmentRender';

interface AttachmentPreviewThumbnailProps {
	attachment: ApiMessageAttachment;
	onRemove?: (channelId: string, index: number) => void;
	indexOfItem: number;
	channelId: string;
}

const AttachmentPreviewThumbnail: React.FC<AttachmentPreviewThumbnailProps> = ({ attachment, onRemove, indexOfItem, channelId }) => {
	const [isHideAttachment, setIsHideAttachment] = useState(false);

	const handleRemove = () => {
		if (onRemove) {
			onRemove(channelId, indexOfItem);
		}
	};

	const filename = attachment.filename;
	const displayedFilename = filename && filename.length > 25 ? filename.substring(0, 25) + '...' : filename;
	const thumbnailAttachment = RenderAttachmentThumbnail(attachment);

	const handleShowAttachment = () => {
		setIsHideAttachment(!isHideAttachment);
	};

	return (
		<div
			title={attachment.filename}
			className="flex justify-center items-center p-2 mb-3 rounded dark:bg-bgSecondary bg-bgLightSecondary w-[216px] h-[216px] flex-shrink-0 border dark:text-textDarkTheme text-textLightTheme dark:border-bgSecondary relative"
		>
			<div className="cursor-pointer rounded-md flex flex-row justify-center items-center mb-2">
				<div>{thumbnailAttachment}</div>
				<div className="dark:bg-bgPrimary bg-bgLightPrimary flex flex-row w-21 top-[-1px] right-[-16px] h-8 absolute rounded-sm shadow-shadowInbox">
					<button
						onClick={handleShowAttachment}
						className="w-8 h-8 flex flex-row justify-center items-center dark:hover:bg-bgHover hover:bg-bgLightModeButton"
					>
						{isHideAttachment ? (
							<Icons.EyeClose className="w-5 h-5 dark:text-textThreadPrimary text-buttonProfile dark:hover:text-textPrimary hover:text-bgPrimary" />
						) : (
							<Icons.EyeOpen className="w-5 h-5 dark:text-textThreadPrimary text-buttonProfile dark:hover:text-textPrimary hover:text-bgPrimary" />
						)}
					</button>
					<button className="w-8 h-8 flex flex-row justify-center items-center dark:hover:bg-bgHover hover:bg-bgLightModeButton">
						<Icons.PenEdit className="w-5 h-5 dark:text-textThreadPrimary text-buttonProfile dark:hover:text-textPrimary hover:text-bgPrimary" />
					</button>
					<button
						onClick={handleRemove}
						className="w-8 h-8 flex flex-row justify-center items-center dark:hover:bg-bgHover hover:bg-bgLightModeButton"
					>
						<Icons.TrashIcon className="w-5 h-5 text-colorDanger hover:text-colorDangerHover" />
					</button>
				</div>
				<div className=" absolute bottom-0 mt-2 left-1 text-sm ">
					<p className="">{displayedFilename}</p>
				</div>
			</div>
		</div>
	);
};

export default AttachmentPreviewThumbnail;
