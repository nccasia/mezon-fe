import {
	messagesActions,
	selectChannelById,
	selectCurrentChannel,
	selectCurrentClanId,
	selectDirectById,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { ChannelStreamMode } from 'mezon-js';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppParams } from '../../app/hooks/useAppParams';

export type UseDeleteMessageOptions = {
	channelId: string;
	mode: number;
};

export function useDeleteMessage({ channelId, mode }: UseDeleteMessageOptions) {
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const { directId } = useAppParams();
	const isDM = [ChannelStreamMode.STREAM_MODE_DM, ChannelStreamMode.STREAM_MODE_GROUP].includes(mode);
	const direct = useAppSelector((state) => selectDirectById(state, directId || (isDM && channelId) || ''));
	const { clientRef, sessionRef, socketRef } = useMezon();
	const channel = useSelector(selectCurrentChannel);
	const parent = useSelector(selectChannelById(channel?.parrent_id || ''));

	const deleteSendMessage = React.useCallback(
		async (messageId: string) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}
			let channelIdDelete = channelId;
			let clanId = currentClanId;
			if (direct) {
				channelIdDelete = direct.id || '';
				clanId = '0';
			}

			dispatch(
				messagesActions.remove({
					channelId: channelIdDelete,
					messageId
				})
			);

			await socket.removeChatMessage(
				clanId || '',
				channel?.parrent_id || '',
				channelIdDelete,
				mode,
				channel ? !channel.channel_private : false,
				parent ? !parent.channel_private : false,
				messageId
			);
		},
		[sessionRef, clientRef, socketRef, channel, direct, channelId, dispatch, currentClanId, mode]
	);

	return useMemo(
		() => ({
			deleteSendMessage
		}),
		[deleteSendMessage]
	);
}
