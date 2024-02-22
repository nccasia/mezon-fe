import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import React, { useMemo } from 'react';
import { useClans } from './useClans';

export type UseChatSendingOptions = {
	channelId: string;
};

export function useChatSending({ channelId }: UseChatSendingOptions) {
	const { currentClanId } = useClans();

	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();

	const client = clientRef.current;
	// const dispatch = useAppDispatch();

	const sendMessage = React.useCallback(
		async (message: IMessageSendPayload) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;

			if (!client || !session || !socket || !channel || !currentClanId) {
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage(currentClanId, channel.id, message);
		},
		[sessionRef, clientRef, socketRef, channelRef, currentClanId],
	);

	return useMemo(
		() => ({
			client,
			sendMessage,
		}),
		[client, sendMessage],
	);
}
