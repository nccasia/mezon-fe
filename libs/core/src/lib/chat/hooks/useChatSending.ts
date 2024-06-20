import { messagesActions, selectChannelById, selectCurrentClanId, selectCurrentUserId, selectDirectById, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ChannelStreamMode } from 'mezon-js';

export type UseChatSendingOptions = {
	channelId: string;
	channelLabel: string;
	mode: number;
};

// TODO: separate this hook into 2 hooks for send and edit message
export function useChatSending({ channelId, channelLabel, mode }: UseChatSendingOptions) {
	const currentClanId = useSelector(selectCurrentClanId);
	const currentUserId = useSelector(selectCurrentUserId);

	const dispatch = useAppDispatch();
	// TODO: if direct is the same as channel use one slice
	// If not, using 2 hooks for direct and channel
	const direct = useSelector(selectDirectById(channelId));
	const { clientRef, sessionRef, socketRef } = useMezon();
	const channel = useSelector(selectChannelById(channelId));

	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean,
			mentionEveryone?: boolean,
		) => {
			return dispatch(messagesActions.sendMessage({
				channelId,
				clanId: currentClanId ?? '',
				mode,
				channelLabel,
				content,
				mentions,
				attachments,
				references,
				anonymous,
				mentionEveryone,
				senderId: currentUserId,
			}))
		},
		[dispatch, channelId, currentClanId, mode, channelLabel, currentUserId],
	);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ channelId, channelLabel, mode }));
	}, [channelId, channelLabel, dispatch, mode]);

	// TODO: why "Edit" not "edit"?
	// Move this function to to a new action of messages slice
	const EditSendMessage = React.useCallback(
		async (content: string, messageId: string) => {
			const editMessage: IMessageSendPayload = {
				t: content,
			};
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}
			let channelLabelEdit = ""
			if (mode === ChannelStreamMode.STREAM_MODE_CHANNEL) {
				channelLabelEdit = channel?.channel_label || "";
			} 
			await socket.updateChatMessage(channelId, channelLabelEdit, mode, messageId, editMessage);
		},
		[sessionRef, clientRef, socketRef, channel, direct, mode, channelId],
	);

	return useMemo(
		() => ({
			sendMessage,
			sendMessageTyping,
			EditSendMessage,
		}),
		[sendMessage, sendMessageTyping, EditSendMessage],
	);
}
