import {
	MessagesEntity,
	messagesActions,
	selectHasMoreMessageByChannelId,
	selectLastMessageByChannelId,
	selectLastMessageIdByChannelId,
	selectMessageByChannelId,
	selectMessageByUserId,
	selectUnreadMessageIdByChannelId,
	useAppDispatch,
	useAppSelector,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export type useMessagesOptions = {
	channelId: string;
};

export function useChatMessages({ channelId }: useMessagesOptions) {
	const { clientRef } = useMezon();

	const client = clientRef.current;
	const dispatch = useAppDispatch();

	const user = useAuth();

	const messages = useSelector(selectMessageByChannelId(channelId));
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const lastMessageId = useAppSelector((state) => selectLastMessageIdByChannelId(state, channelId));
	const lastMessage = useSelector(selectLastMessageByChannelId(channelId));
	const unreadMessageId = useSelector(selectUnreadMessageIdByChannelId(channelId));
	const messageByUserId = useSelector(selectMessageByUserId(channelId, user.userId));

	const loadMoreMessage = React.useCallback(async () => {
		return await dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	const lastMessageByUserId = messageByUserId?.reduce((lastMessage: MessagesEntity, message: MessagesEntity) => {
		return new Date(lastMessage.create_time) > new Date(message.create_time) ? lastMessage : message;
	}, {} as MessagesEntity);

	const setOpenOptionMessageState = useCallback(
		(status: boolean) => {
			dispatch(messagesActions.setOpenOptionMessageState(status));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			client,
			messages,
			unreadMessageId,
			lastMessageId,
			hasMoreMessage,
			lastMessageByUserId,
			loadMoreMessage,
			setOpenOptionMessageState,
			lastMessage,
		}),
		[
			client,
			messages,
			unreadMessageId,
			lastMessageId,
			hasMoreMessage,
			lastMessageByUserId,
			loadMoreMessage,
			setOpenOptionMessageState,
			lastMessage,
		],
	);
}
