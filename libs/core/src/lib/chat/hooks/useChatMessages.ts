import {
	messagesActions,
	selectHasMoreMessageByChannelId,
	selectLastMessageIdByChannelId,
	selectMessageByChannelId,
	selectMessageByUserId,
	selectUnreadMessageIdByChannelId,
	useAppDispatch,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import React, { useMemo } from 'react';
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
	const lastMessageId = useSelector(selectLastMessageIdByChannelId(channelId));
	const unreadMessageId = useSelector(selectUnreadMessageIdByChannelId(channelId));
	const lastMessageByUserId = useSelector(selectMessageByUserId(channelId, user.userId));

	const loadMoreMessage = React.useCallback(async () => {
		return await dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	return useMemo(
		() => ({
			client,
			messages,
			unreadMessageId,
			lastMessageId,
			hasMoreMessage,
			lastMessageByUserId,
			loadMoreMessage,
		}),
		[client, messages, unreadMessageId, lastMessageId, hasMoreMessage, lastMessageByUserId, loadMoreMessage],
	);
}
