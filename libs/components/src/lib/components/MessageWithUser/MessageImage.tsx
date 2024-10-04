import { useAppParams, useAttachments } from '@mezon/core';
import { attachmentActions, selectCurrentChannelId, selectCurrentClanId, selectOneStickerInfor, useAppDispatch } from '@mezon/store';
import { SHOW_POSITION, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { memo, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMessageContextMenu } from '../ContextMenu';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment & { create_time?: string };
	onContextMenu?: (event: React.MouseEvent<HTMLImageElement>) => void;
	mode?: ChannelStreamMode;
	messageId?: string;
};

const MessageImage = memo(({ attachmentData, onContextMenu, mode, messageId }: MessageImage) => {
	const dispatch = useAppDispatch();
	const { setOpenModalAttachment, setAttachment } = useAttachments();
	const isDimensionsValid = attachmentData.height && attachmentData.width && attachmentData.height > 0 && attachmentData.width > 0;
	const checkImage = notImplementForGifOrStickerSendFromPanel(attachmentData);
	const { setImageURL, setPositionShow } = useMessageContextMenu();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
	const { directId: currentDmGroupId } = useAppParams();
	const selectSticker = useSelector(selectOneStickerInfor(attachmentData.filename as string));

	const handleClick = (url: string) => {
		if (isDimensionsValid || checkImage) return;

		dispatch(attachmentActions.setMode(mode));
		setOpenModalAttachment(true);
		setAttachment(url);
		dispatch(
			attachmentActions.setCurrentAttachment({
				id: attachmentData.message_id as string,
				uploader: attachmentData.sender_id,
				create_time: attachmentData.create_time
			})
		);

		// if there is currentDmGroupId is fetch for DM
		if ((currentClanId && currentChannelId) || currentDmGroupId) {
			const clanId = currentDmGroupId ? '0' : (currentClanId as string);
			const channelId = (currentDmGroupId as string) || (currentChannelId as string);
			dispatch(attachmentActions.fetchChannelAttachments({ clanId, channelId }));
		}

		dispatch(attachmentActions.setMessageId(messageId));
	};
	const imgStyle = {
		width: isDimensionsValid ? `${attachmentData.width}%` : undefined,
		height: isDimensionsValid ? `${attachmentData.height}%` : undefined
	};

	const [imageError, setImageError] = useState(false);

	const handleImageError = () => {
		setImageError(true);
	};

	const handleContextMenu = useCallback(
		(e: any) => {
			setImageURL(attachmentData?.url ?? '');
			setPositionShow(SHOW_POSITION.NONE);
			if (typeof onContextMenu === 'function') {
				onContextMenu((e || {}) as React.MouseEvent<HTMLImageElement>);
			}
		},
		[attachmentData?.url, onContextMenu, setImageURL, setPositionShow]
	);

	if (imageError || !attachmentData.url) {
		return null;
	}

	return (
		<div className="relative inline-block">
			{selectSticker?.shortname ? (
				<Tooltip content={selectSticker?.shortname} className={`${checkImage ? '' : 'hidden'}`}>
					<img
						loading="lazy"
						onContextMenu={handleContextMenu}
						className={`max-w-[100%] h-[150px] object-cover object-left-top my-2 rounded cursor-default`}
						src={attachmentData.url?.toString()}
						alt={attachmentData.url}
						onClick={() => handleClick(attachmentData.url || '')}
						style={imgStyle}
						onError={handleImageError}
					/>
				</Tooltip>
			) : (
				<img
					loading="lazy"
					onContextMenu={handleContextMenu}
					className={`max-w-[100%] h-[150px] object-cover object-left-top my-2 rounded cursor-default`}
					src={attachmentData.url?.toString()}
					alt={attachmentData.url}
					onClick={() => handleClick(attachmentData.url || '')}
					style={imgStyle}
					onError={handleImageError}
				/>
			)}
		</div>
	);
});

export default MessageImage;
