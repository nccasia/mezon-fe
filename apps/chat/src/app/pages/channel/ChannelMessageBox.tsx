import { MessageBox, ReplyMessage, UserMentionList } from '@mezon/components';
import { ChatContext, useChatSending } from '@mezon/core';
import { IMessageSendPayload } from '@mezon/utils';
import { useCallback, useContext, useEffect } from 'react';
import { useThrottledCallback } from 'use-debounce';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

export type ChannelMessageBoxProps = {
	channelId: string;
	channelLabel: string;
	controlEmoji?: boolean;
	clanId?: string;
	mode: number;
};

export function ChannelMessageBox({ channelId, channelLabel, controlEmoji, clanId, mode }: ChannelMessageBoxProps) {
	const { sendMessage, sendMessageTyping } = useChatSending({ channelId, channelLabel, mode });
	const handleSend = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
		) => {
			sendMessage(content, mentions, attachments, references);
		},
		[sendMessage],
	);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	const { setIsOpenReply } = useContext(ChatContext);

	useEffect(() => {
		setIsOpenReply(false);
	}, [channelId, clanId]);

	return (
		<div className="mx-4 relative">
			<ReplyMessage />
			<MessageBox
				isOpenEmojiPropOutside={controlEmoji}
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
