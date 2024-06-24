import { GifStickerEmojiPopup, MessageBox, ReplyMessageBox } from '@mezon/components';
import { useDirectMessages, useGifsStickersEmoji } from '@mezon/core';
import { RootState, selectIdMessageRefReaction, selectIsShowMemberList } from '@mezon/store';
import { EmojiPlaces, IMessageSendPayload, SubPanelName } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';

interface DirectIdProps {
	directParamId: string;
	mode: number;
}
export function DirectMessageBox({ directParamId, mode }: DirectIdProps) {
	const { sendDirectMessage, sendMessageTyping } = useDirectMessages({ channelId: directParamId, mode: mode });
	// TODO: move selector to store
	const sessionUser = useSelector((state: RootState) => state.auth.session);
	const isShowMemberList = useSelector(selectIsShowMemberList);
	const { subPanelActive } = useGifsStickersEmoji();
	const [isEmojiOnChat, setIsEmojiOnChat] = useState<boolean>(false);
	const [emojiAction, setEmojiAction] = useState<EmojiPlaces>(EmojiPlaces.EMOJI_REACTION_NONE);
	const idMessageRefReaction = useSelector(selectIdMessageRefReaction);
	const [classNamePopup, setClassNamePopup] = useState<string>(
		`fixed bottom-[66px] z-10 max-sm:hidden bl ${isShowMemberList ? 'right-64' : 'right-4'}`,
	);
	const handleSend = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
		) => {
			if (sessionUser) {
				sendDirectMessage(content, mentions, attachments, references);
			} else {
				console.error('Session is not available');
			}
		},
		[sendDirectMessage, sessionUser],
	);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);
	useEffect(() => {
		if (
			subPanelActive !== SubPanelName.NONE &&
			subPanelActive !== SubPanelName.EMOJI_REACTION_RIGHT &&
			subPanelActive !== SubPanelName.EMOJI_REACTION_BOTTOM
		) {
			setIsEmojiOnChat(true);
		} else {
			setIsEmojiOnChat(false);
		}
	}, [subPanelActive]);

	useEffect(() => {
		if (
			(subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT && window.innerWidth < 640) ||
			(subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM && window.innerWidth < 640)
		) {
			setIsEmojiOnChat(true);
		}
	}, [subPanelActive]);

	useEffect(() => {
		if (subPanelActive === SubPanelName.EMOJI) {
			setEmojiAction(EmojiPlaces.EMOJI_EDITOR);
		}
		if (subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT || subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM) {
			setEmojiAction(EmojiPlaces.EMOJI_REACTION);
		}
	}, [subPanelActive]);


	return (
		<div className="mx-2 relative " role="button" aria-hidden>
			{isEmojiOnChat && (
				<div
					className={classNamePopup}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<GifStickerEmojiPopup />
				</div>
			)}
			<ReplyMessageBox />
			<MessageBox
				onSend={handleSend}
				currentChannelId={directParamId}
				onTyping={handleTypingDebounced}
				// listMentions={UserMentionList(directParamId)}
				mode={mode}
			/>
			{isEmojiOnChat && ( // responsive mobile
				<div
					className={`relative h-[300px]  overflow-y-scroll w-full hidden max-sm:block animate-slideUp`}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<GifStickerEmojiPopup emojiAction={emojiAction} mode={mode} messageEmojiId={idMessageRefReaction} />
				</div>
			)}
		</div>
	);
}

DirectMessageBox.Skeleton = () => {
	return (
		<div>
			<MessageBox.Skeleton />
		</div>
	);
};

export default DirectMessageBox;
