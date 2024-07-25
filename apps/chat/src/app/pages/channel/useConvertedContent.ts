import {
	convertMarkdown,
	emojiRegex,
	hashtagRegex,
	IEmojiOnMessage,
	IHashtagOnMessage,
	ILinkOnMessage,
	IMarkdownOnMessage,
	IMentionOnMessage,
	linkRegex,
	markdownRegex,
	mentionRegex,
} from '@mezon/utils';
import { useEffect, useState } from 'react';

export const useConvertedContent = (plainText: string) => {
	const [content, setContent] = useState({
		t: plainText,
		mentions: [] as IMentionOnMessage[],
		hashtags: [] as IHashtagOnMessage[],
		emojis: [] as IEmojiOnMessage[],
		links: [] as ILinkOnMessage[],
		markdowns: [] as IMarkdownOnMessage[],
	});

	useEffect(() => {
		const mentionArr: IMentionOnMessage[] = [];
		const hashtagArr: IHashtagOnMessage[] = [];
		const emojiArr: IEmojiOnMessage[] = [];
		const linkArr: ILinkOnMessage[] = [];
		const markdownArr: IMarkdownOnMessage[] = [];

		let match;

		// Detect mentions
		while ((match = mentionRegex.exec(plainText)) !== null) {
			mentionArr.push({
				username: `@${match[1]}`,
				userId: '',
				startIndex: match.index,
				endIndex: mentionRegex.lastIndex,
			});
		}

		// Detect hashtags
		while ((match = hashtagRegex.exec(plainText)) !== null) {
			hashtagArr.push({
				channelLable: match[1],
				channelId: match[2],
				startIndex: match.index,
				endIndex: hashtagRegex.lastIndex,
			});
		}

		// Detect emojis
		while ((match = emojiRegex.exec(plainText)) !== null) {
			emojiArr.push({
				shortname: match[0],
				startIndex: match.index,
				endIndex: emojiRegex.lastIndex,
			});
		}

		// Detect links
		while ((match = linkRegex.exec(plainText)) !== null) {
			linkArr.push({
				link: match[0],
				startIndex: match.index,
				endIndex: linkRegex.lastIndex,
			});
		}

		// Detect markdown
		while ((match = markdownRegex.exec(plainText)) !== null) {
			const startsWithTripleBackticks = match[0].startsWith('```');
			const endsWithNoTripleBackticks = match[0].endsWith('```');
			const convertedMarkdown = startsWithTripleBackticks && endsWithNoTripleBackticks ? convertMarkdown(match[0]) : match[0];
			markdownArr.push({
				markdown: convertedMarkdown,
				startIndex: match.index,
				endIndex: markdownRegex.lastIndex,
			});
		}

		setContent({
			t: plainText,
			mentions: mentionArr,
			hashtags: hashtagArr,
			emojis: emojiArr,
			links: linkArr,
			markdowns: markdownArr,
		});
	}, [plainText]);

	return content;
};
