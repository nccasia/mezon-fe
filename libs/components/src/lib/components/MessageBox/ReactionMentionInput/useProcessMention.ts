import { useEffect, useState } from 'react';

interface Mention {
	userId: string;
	username: string;
	startIndex: number;
	endIndex: number;
}

interface Hashtag {
	channelId: string;
	channelLabel: string;
	startIndex: number;
	endIndex: number;
}

const useProcessMention = (text: string) => {
	const [mentionList, setMentionList] = useState<Mention[]>([]);
	const [hashtagList, setHashtagList] = useState<Hashtag[]>([]);
	const [simplifiedMentionList, setSimplifiedMentionList] = useState<{ user_id: string; username: string }[]>([]);

	useEffect(() => {
		const mentions: Mention[] = [];
		const hashtags: Hashtag[] = [];

		const mentionPrefix = '@[';
		const mentionSuffix = '])(';
		const hashtagPrefix = '#[';
		const hashtagSuffix = '])(';

		let index = 0;

		while (index < text.length) {
			if (text.startsWith(mentionPrefix, index)) {
				let startIndex = index;
				index += mentionPrefix.length;

				// Extract username
				const usernameEnd = text.indexOf(']', index);
				const username = text.substring(index, usernameEnd);
				index = usernameEnd + 1;

				// Extract userId
				const userIdStart = text.indexOf('(', index) + 1;
				const userIdEnd = text.indexOf(')', userIdStart);
				const userId = text.substring(userIdStart, userIdEnd);
				index = userIdEnd + 1;

				mentions.push({
					userId,
					username,
					startIndex,
					endIndex: index,
				});
			} else if (text.startsWith(hashtagPrefix, index)) {
				let startIndex = index;
				index += hashtagPrefix.length;

				// Extract channelLabel
				const labelEnd = text.indexOf(']', index);
				const channelLabel = text.substring(index, labelEnd);
				index = labelEnd + 1;

				// Extract channelId
				const channelIdStart = text.indexOf('(', index) + 1;
				const channelIdEnd = text.indexOf(')', channelIdStart);
				const channelId = text.substring(channelIdStart, channelIdEnd);
				index = channelIdEnd + 1;

				hashtags.push({
					channelId,
					channelLabel,
					startIndex,
					endIndex: index,
				});
			} else {
				index++;
			}
		}

		setMentionList(mentions);
		setHashtagList(hashtags);
		const simplifiedList = mentions.map((mention) => ({
			user_id: mention.userId,
			username: mention.username,
		}));

		setSimplifiedMentionList(simplifiedList);
	}, [text]);

	return { mentionList, simplifiedMentionList, hashtagList };
};

export default useProcessMention;
