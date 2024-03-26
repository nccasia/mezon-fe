import { channelMembersActions, channelsActions, selectMessageReacted, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useClans } from './useClans';

export type UseMessageReactionOption = {
	currentChannelId: string | null | undefined;
};

export function useVoiceChannel({ currentChannelId }: UseMessageReactionOption) {
	const dispatch = useAppDispatch();

	const { currentClanId } = useClans();
	const messageDataReactedFromSocket = useSelector(selectMessageReacted);
	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();

	const fetchMemberListVoiceChannel = React.useCallback(async () => {
		dispatch(channelMembersActions.fetchChannelMembersCached({ }));
	}, [currentChannelId, dispatch]);

	return useMemo(
		() => ({
			fetchMemberListVoiceChannel,
		}),
		[fetchMemberListVoiceChannel],
	);
}
