import { GifStickerEmojiPopup, MessageBox, ReplyMessageBox, UserMentionList } from '@mezon/components';
import { useChatSending, useGifsStickersEmoji, useMenu } from '@mezon/core';
import { IMessageSendPayload, SubPanelName, ThreadValue } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback, useEffect, useState } from 'react';
import { useThrottledCallback } from 'use-debounce';

export type ChannelMessageBoxProps = {
	channelId: string;
	channelLabel: string;
	clanId?: string;
	mode: number;
};

export function ChannelMessageBox({ channelId, channelLabel, clanId, mode }: Readonly<ChannelMessageBoxProps>) {
	const { sendMessage, sendMessageTyping } = useChatSending({ channelId, channelLabel, mode });
	const { isShowMemberList } = useMenu();
	const { subPanelActive } = useGifsStickersEmoji();
	const [classNamePopup, setClassNamePopup] = useState<string>(`fixed bottom-[66px] z-10 ${isShowMemberList ? 'right-64' : 'right-4'}`);
	const [isEmojiOnChat, setIsEmojiOnChat] = useState<boolean>(false);
	const [isReactionEmojiRight, setIsReactionEmojiRight] = useState<boolean>(false);
	const [isReactionEmojiBottom, setIsReactionEmojiBottom] = useState<boolean>(false);

	const handleSend = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			value?: ThreadValue,
			anonymous?: boolean,
		) => {
			sendMessage(content, mentions, attachments, references, anonymous);
		},
		[sendMessage],
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

	return (
		<div className="mx-4 relative" role="button" aria-hidden>
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
				listMentions={UserMentionList(channelId)}
				onSend={handleSend}
				onTyping={handleTypingDebounced}
				currentChannelId={channelId}
				currentClanId={clanId}
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
