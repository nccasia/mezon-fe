import { useAttachments, useOnClickOutside, useRightClick } from '@mezon/core';
import { selectRightClickXy } from '@mezon/store';
import { notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
};

function MessageImage({ attachmentData }: MessageImage) {
	const { setOpenModalAttachment, setAttachment } = useAttachments();
	const isDimensionsValid = attachmentData.height && attachmentData.width && attachmentData.height > 0 && attachmentData.width > 0;
	const checkImage = notImplementForGifOrStickerSendFromPanel(attachmentData);
	const imageRef = useRef<HTMLDivElement | null>(null);
	const { setRightClickXy } = useRightClick();
	const handleClick = (url: string) => {
		if (!isDimensionsValid && !checkImage) {
			setOpenModalAttachment(true);
			setAttachment(url);
		}
		handleCloseMenu();
	};
	const imgStyle = {
		width: isDimensionsValid ? `${attachmentData.width}%` : undefined,
		height: isDimensionsValid ? `${attachmentData.height}%` : undefined,
	};

	const [isMenuVisible, setMenuVisible] = useState(false);
	const handleContextMenu = (event: React.MouseEvent<HTMLImageElement>) => {
		event.preventDefault();
		setRightClickXy({ x: event.pageX, y: event.pageY });
		setMenuVisible(true);
	};

	const handleCloseMenu = () => {
		setMenuVisible(false);
	};

	useOnClickOutside(imageRef, handleCloseMenu);
	// const rightClickXy2 = useSelector(selectRightClickXy);
	// console.log(rightClickXy2);
	return (
		<div ref={imageRef} className="break-all" onContextMenu={handleContextMenu}>
			<img
				className={
					'max-w-[100%] max-h-[30vh] object-cover my-2 rounded ' + (!isDimensionsValid && !checkImage ? 'cursor-pointer' : 'cursor-default')
				}
				src={attachmentData.url?.toString()}
				alt={attachmentData.url}
				onClick={() => handleClick(attachmentData.url || '')}
				style={imgStyle}
			/>
			{/* {isMenuVisible && <ContextMenu urlData={attachmentData.url ?? ''} posClick={RightClickPost.IMAGE_ON_CHANNEL} onClose={handleCloseMenu} />} */}
		</div>
	);
}

export default MessageImage;
