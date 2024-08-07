import { useMezon } from '@mezon/transport';
import { ILinkOnMessage, IMarkdownOnMessage, IMessageSendPayload } from '@mezon/utils';
import React, { useMemo } from 'react';

export function useSendInviteMessage() {
	const { clientRef, sessionRef, socketRef } = useMezon();
	const client = clientRef.current;

	const sendInviteMessage = React.useCallback(
		async (url: string, channel_id: string, channelMode: number) => {
			const { links, markdowns } = processText(url);

			const content: IMessageSendPayload = {
				t: url,
				links: links,
				markdowns: markdowns,
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

const processText = (inputString: string) => {
	const links: ILinkOnMessage[] = [];
	const markdowns: IMarkdownOnMessage[] = [];

	const singleBacktick: string = '`';
	const tripleBacktick: string = '```';
	const httpPrefix: string = 'http';

	let i = 0;
	while (i < inputString.length) {
		if (inputString.startsWith(httpPrefix, i)) {
			// Link processing
			const startindex = i;
			i += httpPrefix.length;
			while (i < inputString.length && ![' ', '\n', '\r', '\t'].includes(inputString[i])) {
				i++;
			}
			const endindex = i;
			const link = inputString.substring(startindex, endindex);

			links.push({
				link,
				startindex,
				endindex,
			});
		} else if (inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
			// Triple backtick markdown processing
			const startindex = i;
			i += tripleBacktick.length;
			let markdown = '';
			while (i < inputString.length && inputString.substring(i, i + tripleBacktick.length) !== tripleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
				i += tripleBacktick.length;
				const endindex = i;
				markdowns.push({ type: 'triple', markdown: `\`\`\`${markdown}\`\`\``, startindex, endindex });
			}
		} else if (inputString[i] === singleBacktick) {
			// Single backtick markdown processing
			const startindex = i;
			i++;
			let markdown = '';
			while (i < inputString.length && inputString[i] !== singleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString.length && inputString[i] === singleBacktick) {
				const endindex = i + 1;
				const nextChar = inputString[endindex];
				if (!markdown.includes('``') && markdown !== '' && nextChar !== singleBacktick) {
					markdowns.push({ type: 'single', markdown: `\`${markdown}\``, startindex, endindex });
				}
				i++;
			}
		} else {
			i++;
		}
	}

	return { links, markdowns };
};
