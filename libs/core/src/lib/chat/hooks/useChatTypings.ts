import { messagesActions, selectChannelMemberByUserIds, selectTypingUserIdsByChannelId, useAppDispatch } from '@mezon/store';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

interface UseChatTypingsOptions {
	channelId: string;
}

export function useChatTypings({ channelId }: UseChatTypingsOptions) {
	const typingUsersIds = useSelector(selectTypingUserIdsByChannelId(channelId));
	const typingUsers = useSelector(selectChannelMemberByUserIds(channelId, typingUsersIds || []));

	const dispatch = useAppDispatch();

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ channelId }));
	}, [channelId, dispatch]);

	return useMemo(
		() => ({
			typingUsers,
			sendMessageTyping,
		}),
		[typingUsers, sendMessageTyping],
	);
}
