import { notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useState } from 'react';
import MessageModalImage from './MessageModalImage';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
};

function MessageImage({ attachmentData }: MessageImage) {
	const [openModal, setOpenModal] = useState(false);
	const isDimensionsValid = attachmentData.height && attachmentData.width && attachmentData.height > 0 && attachmentData.width > 0;
	const checkImage = notImplementForGifOrStickerSendFromPanel(attachmentData);

	const closeModal = () => {
		setOpenModal(false);
	};
	const handleClick = () => {
		if (!isDimensionsValid && !checkImage) {
			setOpenModal(true);
		}
	};
	const imgStyle = {
		width: isDimensionsValid ? `${attachmentData.width}%` : undefined,
		height: isDimensionsValid ? `${attachmentData.height}%` : undefined,
	};
	return (
		<>
			<div className="break-all">
				<img
					className={"max-w-[100%] max-h-[30vh] object-cover my-2 rounded " + (!isDimensionsValid && !checkImage ? "cursor-pointer" : "cursor-default")}
					src={attachmentData.url?.toString()}
					alt={attachmentData.url}
					onClick={handleClick}
					style={imgStyle}

				/>
			</div>

			<MessageModalImage open={openModal} closeModal={closeModal} url={attachmentData.url} />
		</>
	);
}

export default MessageImage;
