import { GifStickerEmojiPopup, MessageBox, ReplyMessageBox, UserMentionList } from '@mezon/components';
import { useChatSending, useEscapeKey, useGifsStickersEmoji } from '@mezon/core';
import { referencesActions, selectDataReferences, selectIsViewingOlderMessagesByChannelId } from '@mezon/store';
import { EmojiPlaces, IMessageSendPayload, SubPanelName, ThreadValue, blankReferenceObj } from '@mezon/utils';
import classNames from 'classnames';
import { ApiChannelDescription, ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { ChannelJumpToPresent } from './ChannelJumpToPresent';

export type ChannelMessageBoxProps = {
	channel: ApiChannelDescription;
	clanId?: string;
	mode: number;
};

export function ChannelMessageBox({ channel, clanId, mode }: Readonly<ChannelMessageBoxProps>) {
	const isViewingOldMessage = useSelector(selectIsViewingOlderMessagesByChannelId(channel?.channel_id ?? ''));
	const channelId = useMemo(() => {
		return channel.channel_id;
	}, [channel.channel_id]);
	const dispatch = useDispatch();
	const { sendMessage, sendMessageTyping } = useChatSending({ channelOrDirect: channel, mode });
	const { subPanelActive } = useGifsStickersEmoji();

	const dataReferences = useSelector(selectDataReferences(channelId ?? ''));
	const [isEmojiOnChat, setIsEmojiOnChat] = useState<boolean>(false);

	const chatboxRef = useRef<HTMLDivElement | null>(null);
	const handleSend = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			value?: ThreadValue,
			anonymous?: boolean,
			mentionEveryone?: boolean
		) => {
			sendMessage(content, mentions, attachments, references, anonymous, mentionEveryone);
		},
		[sendMessage]
	);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);
	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	useEffect(() => {
		const isEmojiReactionPanel = subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT || subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM;

		const isOtherActivePanel = subPanelActive !== SubPanelName.NONE && !isEmojiReactionPanel;

		const isSmallScreen = window.innerWidth < 640;

		const isActive = isOtherActivePanel || (isEmojiReactionPanel && isSmallScreen);

		setIsEmojiOnChat(isActive);
	}, [subPanelActive]);

	const handleCloseReplyMessageBox = () => {
		dispatch(
			referencesActions.setDataReferences({
				channelId: channelId ?? '',
				dataReferences: blankReferenceObj
			})
		);
	};

	useEscapeKey(handleCloseReplyMessageBox);
	return (
		<div className="mx-4 relative" role="button" ref={chatboxRef}>
			{isEmojiOnChat && (
				<div
					onClick={(e) => {
						e.stopPropagation();
					}}
					className={`right-[2px] absolute z-10`}
					style={{
						bottom: chatboxRef.current ? `${chatboxRef.current.offsetHeight}px` : ''
					}}
				>
					<GifStickerEmojiPopup channelOrDirect={channel} emojiAction={EmojiPlaces.EMOJI_EDITOR} mode={mode} />
				</div>
			)}

			<div className="absolute bottom-[calc(100%-10px)] left-0 right-0">
				{isViewingOldMessage && (
					<div
						className={classNames(
							'relative z-0 px-2 py-1 text-sm bg-bgAccent dark:bg-bgDarkAccent rounded-md',
							dataReferences.message_ref_id ? 'top-[8px]' : ''
						)}
					>
						<ChannelJumpToPresent channelId={channelId ?? ''} className="pb-[10px]" />
					</div>
				)}
				{dataReferences.message_ref_id && (
					<div className="relative z-1 pb-[4px]">
						<ReplyMessageBox channelId={channelId ?? ''} dataReferences={dataReferences} className="pb-[15px]" />
					</div>
				)}
			</div>

			<MessageBox
				listMentions={UserMentionList({ channelID: channelId ?? '', channelMode: mode })}
				onSend={handleSend}
				onTyping={handleTypingDebounced}
				currentChannelId={channelId}
				currentClanId={clanId}
				mode={mode}
			/>
		</div>
	);
}

ChannelMessageBox.Skeleton = () => {
	return (
		<div>
			<MessageBox.Skeleton />
		</div>
	);
};

const MemoizedChannelMessageBox = memo(ChannelMessageBox) as unknown as typeof ChannelMessageBox & { Skeleton: typeof ChannelMessageBox.Skeleton };
export default MemoizedChannelMessageBox;
