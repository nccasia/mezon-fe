import { useMezon } from '@mezon/transport';
import { convertMarkdown, ILinkOnMessage, ImarkdownOnMessage, IMessageSendPayload, linkRegex, markdownRegex } from '@mezon/utils';
import React, { useMemo } from 'react';


export function useSendInviteMessage() {
	const { clientRef, sessionRef, socketRef } = useMezon();
	const client = clientRef.current;

	const sendInviteMessage = React.useCallback(
		async (url: string, channel_id: string, channelMode: number) => {
			const linkList: ILinkOnMessage[] = [];
			const markdownList: ImarkdownOnMessage[] = [];
			let match;
			while ((match = linkRegex.exec(url)) !== null) {
				linkList.push({
					link: match[0],
					startIndex: match.index,
					endIndex: match.index + match[0].length,
				});
			}

			while ((match = markdownRegex.exec(url)) !== null) {
				const startsWithTripleBackticks = match[0].startsWith('```');
				const endsWithNoTripleBackticks = match[0].endsWith('```');
				const convertedMarkdown = startsWithTripleBackticks && endsWithNoTripleBackticks ? convertMarkdown(match[0]) : match[0];
				markdownList.push({
					markdown: convertedMarkdown,
					startIndex: match.index,
					endIndex: match.index + match[0].length,
				});
			}
            const content: IMessageSendPayload = {
                t: url,
				links: linkList,
				markdowns: markdownList,
            };
			
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !channel_id) {
				console.log(client, session, socket, channel_id);
				throw new Error('Client is not initialized');
			}
			
			await socket.writeChatMessage('DM', channel_id, channelMode, content, [], [], []);
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
