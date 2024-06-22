import {
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageWithUser } from '@mezon/utils';
import React, { useMemo } from 'react';


export function useSendForwardMessage() {
	const { clientRef, sessionRef, socketRef } = useMezon();

	const client = clientRef.current;

	const sendForwardMessage = React.useCallback(
		async (clanid: string, channel_id:string, mode:number, message: IMessageWithUser) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !channel_id) {
				console.log(client, session, socket, channel_id);
				throw new Error('Client is not initialized');
			}
			
			await socket.writeChatMessage(clanid, channel_id, mode, message.content, message.mentions, message.attachments, message.references);
		},
		[sessionRef, clientRef, socketRef],
	);

	return useMemo(
		() => ({
			client,
			sendForwardMessage
		}),
		[ client, sendForwardMessage ],
	);
}
