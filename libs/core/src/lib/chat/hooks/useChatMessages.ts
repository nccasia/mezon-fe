import {
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
import { useClans } from './useClans';

export type useMessagesOptions = {
	channelId: string;
};

export function useChatMessages({ channelId }: useMessagesOptions) {
	const { currentClanId } = useClans();

	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();

	const client = clientRef.current;
	const dispatch = useAppDispatch();

	const messages = useSelector(selectMessageByChannelId(channelId));
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const lastMessageId = useSelector(selectLastMessageIdByChannelId(channelId));
	const unreadMessageId = useSelector(selectUnreadMessageIdByChannelId(channelId));

	const sendMessage = React.useCallback(
		async (message: IMessageSendPayload) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;

			if (!client || !session || !socket || !channel || !currentClanId) {
				console.log(client, session, socket, channel, currentClanId);
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage(currentClanId, channel.id, message);
		},
		[sessionRef, clientRef, socketRef, channelRef, currentClanId],
	);

	const loadMoreMessage = React.useCallback(async () => {
		dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	return useMemo(
		() => ({
			client,
			messages,
			unreadMessageId,
			lastMessageId,
			hasMoreMessage,
			sendMessage,
			loadMoreMessage,
		}),
		[client, messages, unreadMessageId, lastMessageId, hasMoreMessage, sendMessage, loadMoreMessage],
	);
}
