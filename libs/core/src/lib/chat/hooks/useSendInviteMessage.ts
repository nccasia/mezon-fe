import { useMezon } from '@mezon/transport';
import { IMessageSendPayload, processText } from '@mezon/utils';
import React, { useMemo } from 'react';

export function useSendInviteMessage() {
	const { clientRef, sessionRef, socketRef } = useMezon();
	const client = clientRef.current;

	const sendInviteMessage = React.useCallback(
		async (url: string, channel_id: string, channelMode: number) => {
			const { links, markdowns } = await processText(url);

			const content: IMessageSendPayload = {
				t: url,
				lk: links,
				mk: markdowns,
			};

			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !channel_id) {
				console.log(client, session, socket, channel_id);
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage('0', channel_id, channelMode, content, [], [], []);
		},
		[sessionRef, clientRef, socketRef],
	);

	return useMemo(
		() => ({
			client,
			sendInviteMessage,
		}),
		[client, sendInviteMessage],
	);
}
