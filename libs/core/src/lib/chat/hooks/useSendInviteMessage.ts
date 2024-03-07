import {
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import React, { useMemo } from 'react';


export function useSendInviteMessage() {
	const { clientRef, sessionRef, socketRef } = useMezon();

	const client = clientRef.current;

	const sendInviteMessage = React.useCallback(
		async (url: string, channel_id: string) => {
            const content: IMessageSendPayload = {
                t: url
              };
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !channel_id) {
				console.log(client, session, socket, channel_id);
				throw new Error('Client is not initialized');
			}
			
			await socket.writeChatMessage('', channel_id, content, [], [], []);
		},
		[sessionRef, clientRef, socketRef],
	);

	

	return useMemo(
		() => ({
			client,
			sendInviteMessage,
		}),
		[client,sendInviteMessage],
	);
}
