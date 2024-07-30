import { messagesActions, selectCurrentChannel, selectCurrentClanId, selectDirectById, useAppDispatch } from '@mezon/store';
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
	const direct = useSelector(selectDirectById(directId || (isDM && channelId) || ''));
	const { clientRef, sessionRef, socketRef } = useMezon();
	const channel = useSelector(selectCurrentChannel);

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
					messageId,
				}),
			);

			await socket.removeChatMessage(clanId || '', channelIdDelete, mode, messageId);
		},
		[sessionRef, clientRef, socketRef, channel, direct, channelId, dispatch, currentClanId, mode],
	);

	return useMemo(
		() => ({
			deleteSendMessage,
		}),
		[deleteSendMessage],
	);
}
