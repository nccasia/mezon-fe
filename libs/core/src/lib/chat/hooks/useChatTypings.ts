import {
	messagesActions,
	selectChannelById,
	selectChannelMemberByUserIds,
	selectCurrentChannel,
	selectCurrentClanId,
	selectTypingUserIdsByChannelId,
	useAppDispatch
} from '@mezon/store';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

interface UseChatTypingsOptions {
	channelId: string;
	mode: number;
	isPublic: boolean;
	isDM?: boolean;
}

export function useChatTypings({ channelId, mode, isPublic, isDM = false }: UseChatTypingsOptions) {
	const { userId } = useAuth();
	const typingUsersIds = useSelector(selectTypingUserIdsByChannelId(channelId));
	const typingUsers = useSelector(selectChannelMemberByUserIds(channelId, typingUsersIds?.filter((userID) => userID !== userId) || [], isDM));
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	const parent = useSelector(selectChannelById(currentChannel?.parrent_id || ''));

	const dispatch = useAppDispatch();

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(
			messagesActions.sendTypingUser({
				clanId: currentClanId || '',
				parentId: currentChannel?.parrent_id || '',
				channelId,
				mode,
				isPublic: isPublic,
				isParentPublic: parent ? !parent.channel_private : false
			})
		);
	}, [channelId, currentClanId, dispatch, isPublic, mode]);

	return useMemo(
		() => ({
			typingUsers,
			sendMessageTyping
		}),
		[typingUsers, sendMessageTyping]
	);
}
