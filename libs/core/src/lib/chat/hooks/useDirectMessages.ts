import {
	directActions,
	messagesActions,
	selectHasMoreMessageByChannelId,
	selectLastMessageIdByChannelId,
	selectMessageByChannelId,
	selectUnreadMessageIdByChannelId,
	useAppDispatch,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ApiMessageMention, ApiMessageAttachment, ApiMessageRef } from 'mezon-js/api.gen';
import { useChatMessages } from './useChatMessages';

export type UseDirectMessagesOptions = {
	channelId: string;
	mode: number;
};

export function useDirectMessages({ channelId, mode }: UseDirectMessagesOptions) {
	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();

	const client = clientRef.current;
	const dispatch = useAppDispatch();

	const messages = useSelector(selectMessageByChannelId(channelId));
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const lastMessageId = useSelector(selectLastMessageIdByChannelId(channelId));
	const unreadMessageId = useSelector(selectUnreadMessageIdByChannelId(channelId));
	const { lastMessage } = useChatMessages({ channelId });

	const sendDirectMessage = React.useCallback(
		async (content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>, 
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;

			if (!client || !session || !socket || !channel) {
				console.log(client, session, socket, channel);
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage('DM', channel.id, channel.chanel_label, mode, content, mentions, attachments, references);
			const timestamp = Date.now() / 1000;
			dispatch(directActions.setDirectLastSeenTimestamp({ channelId: channel.id, timestamp }));
			if (lastMessage) {
				dispatch(directActions.updateLastSeenTime(lastMessage));
			}
		},
		[sessionRef, clientRef, socketRef, channelRef, mode],
	);

	const loadMoreMessage = React.useCallback(async () => {
		dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ channelId: channelId, channelLabel: '', mode: mode}));
	}, [channelId, dispatch]);

	return useMemo(
		() => ({
			client,
			messages,
			unreadMessageId,
			lastMessageId,
			hasMoreMessage,
			sendDirectMessage,
			loadMoreMessage,
			sendMessageTyping,
		}),
		[client, messages, unreadMessageId, lastMessageId, hasMoreMessage, sendMessageTyping, sendDirectMessage, loadMoreMessage],
	);
}
