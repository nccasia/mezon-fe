import { IEmojiOnMessage, IHashtagOnMessage, ILinkOnMessage, IMarkdownOnMessage, IMentionOnMessage } from '@mezon/utils';
import { useMemo, useState } from 'react';

export const useConvertedContent = (
	plainText: string,
	mentions: IMentionOnMessage[],
	hashtags: IHashtagOnMessage[],
	emojis: IEmojiOnMessage[],
	links: ILinkOnMessage[],
	markdowns: IMarkdownOnMessage[],
) => {
	const content = useMemo(() => {
		return {
			t: plainText,
			mentions: mentions,
			hashtags: hashtags,
			emojis: emojis,
			links: links,
			markdowns: markdowns,
		};
	}, [plainText]);

	const [convertedContent, setConvertedContent] = useState(content);

	useMemo(() => {
		setConvertedContent(content);
	}, [content]);

	return convertedContent;
};
