import { channelsActions, messagesActions, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import React, { useMemo } from 'react';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useClans } from './useClans';

export type UseChatSendingOptions = {
	channelId: string;
	channelLabel: string;
	mode: number;
};

export function useChatSending({ channelId, channelLabel, mode }: UseChatSendingOptions) {
	const { currentClanId } = useClans();
	const dispatch = useAppDispatch();

	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();

	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;

			if (!client || !session || !socket || !channel || !currentClanId) {
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage(currentClanId, channel.id, channel.chanel_label, mode, content, mentions, attachments, references, anonymous);
			const timestamp = Date.now() / 1000;
			dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId, timestamp }));
		},
		[sessionRef, clientRef, socketRef, channelRef, currentClanId, mode, dispatch, channelId],
	);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ channelId, channelLabel, mode }));
	}, [channelId, channelLabel, dispatch, mode]);

	const EditSendMessage = React.useCallback(
		async (content: string, messageId: string) => {
			const editMessage: IMessageSendPayload = {
				t: content,
			};
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;

			if (!client || !session || !socket || !channel || !currentClanId) {
				throw new Error('Client is not initialized');
			}
			if (mode === 4) {
				await socket.updateChatMessage(channelId, '', mode, messageId, editMessage);
			} else {
				await socket.updateChatMessage(channelId, channelLabel, mode, messageId, editMessage);
			}
		},
		[sessionRef, clientRef, socketRef, channelRef, currentClanId, mode, channelId, channelLabel],
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
