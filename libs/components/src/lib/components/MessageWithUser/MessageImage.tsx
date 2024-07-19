import { useAttachments } from '@mezon/core';
import { attachmentActions } from '@mezon/store';
import { SHOW_POSITION, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMessageContextMenu } from '../ContextMenu';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
	onContextMenu?: (event: React.MouseEvent<HTMLImageElement>) => void;
	mode?: ChannelStreamMode;
	messageId?: string;
};

function MessageImage({ attachmentData, onContextMenu, mode, messageId }: MessageImage) {
	const dispatch = useDispatch();
	const { setOpenModalAttachment, setAttachment } = useAttachments();
	const isDimensionsValid = attachmentData.height && attachmentData.width && attachmentData.height > 0 && attachmentData.width > 0;
	const checkImage = notImplementForGifOrStickerSendFromPanel(attachmentData);
	const { setImageURL, setPositionShow } = useMessageContextMenu();

	const handleClick = (url: string) => {
		if (!isDimensionsValid && !checkImage) {
			setOpenModalAttachment(true);
			setAttachment(url);
			dispatch(attachmentActions.setMode(mode));
			dispatch(attachmentActions.setMessageId(messageId));
		}
	};
	const imgStyle = {
		width: isDimensionsValid ? `${attachmentData.width}%` : undefined,
		height: isDimensionsValid ? `${attachmentData.height}%` : undefined,
	};

	const [error, setError] = useState<boolean>(false);

	const handleError = useCallback(() => {
		setError(true);
	}, []);

	const handleContextMenu = useCallback(
		(e: any) => {
			setImageURL(attachmentData?.url ?? '');
			setPositionShow(SHOW_POSITION.NONE);
			if (typeof onContextMenu === 'function') {
				onContextMenu((e || {}) as React.MouseEvent<HTMLImageElement>);
			}
		},
		[attachmentData?.url, onContextMenu, setImageURL, setPositionShow],
	);

	return (
		<div className="break-all">
			{!error && (
				<img
					onContextMenu={handleContextMenu}
					className={
						'max-w-[100%] max-h-[30vh] object-cover my-2 rounded ' +
						(!isDimensionsValid && !checkImage ? 'cursor-pointer' : 'cursor-default')
					}
					src={attachmentData.url?.toString()}
					alt=""
					onClick={() => handleClick(attachmentData.url || '')}
					style={imgStyle}
					onError={handleError}
				/>
			)}
		</div>
	);
}

export default memo(MessageImage);
