import {
	messagesActions,
	selectChannelById,
	selectChannelMemberByUserIds,
	selectCurrentChannel,
	selectCurrentClanId,
	selectTypingUserIdsByChannelId,
	useAppDispatch,
	useAppSelector
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

export function useChatTypings({ channelId, mode, isPublic, isDM }: UseChatTypingsOptions) {
	const { userId } = useAuth();
	const typingUsersIds = useAppSelector((state) => selectTypingUserIdsByChannelId(state, channelId));
	const typingUsers = useAppSelector((state) =>
		selectChannelMemberByUserIds(
			state,
			channelId,
			typingUsersIds?.length
				? typingUsersIds
					?.filter((item) => item.id !== userId)
					.map((item) => item.id)
					.splice(0, 2) // only handle <= 2 items because business logic only show several user typing
					.join('/')
				: '',
			isDM ? '1' : ''
		)
	);

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
