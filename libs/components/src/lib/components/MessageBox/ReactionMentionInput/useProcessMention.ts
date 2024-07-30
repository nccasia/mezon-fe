import { MentionItem } from 'react-mentions';
import useIsWithinBackticks from './useIsWithinBackticks';
interface PositionTracker {
	[key: string]: number;
}

const useProcessMention = (mentions: MentionItem[], convertedHashtag: string) => {
	const mentionList = [];
	const hashtagList = [];
	let positionTracker: PositionTracker = {};
	const isWithinBackticks = useIsWithinBackticks(convertedHashtag);

	for (const mention of mentions) {
		let startIndex = -1;
		let endIndex = -1;
		if (mention.display.startsWith('@') || mention.display.startsWith('#')) {
			const mentionPattern = mention.display.startsWith('@') ? mention.display : `<#${mention.id.toString()}>`;
			const patternLength = mentionPattern.length;

			if (!positionTracker[mentionPattern]) {
				positionTracker[mentionPattern] = 0;
			}

			startIndex = convertedHashtag.indexOf(mentionPattern, positionTracker[mentionPattern]);

			// Check if mention is within backticks
			while (startIndex !== -1) {
				if (!isWithinBackticks(startIndex)) {
					endIndex = startIndex + patternLength;
					positionTracker[mentionPattern] = endIndex;

					if (mention.display.startsWith('@')) {
						mentionList.push({
							userId: mention.id.toString() ?? '',
							username: mention.display ?? '',
							startIndex: startIndex,
							endIndex: endIndex,
						});
					} else if (mention.display.startsWith('#')) {
						hashtagList.push({
							channelId: mention.id.toString() ?? '',
							channelLabel: mention.display ?? '',
							startIndex: startIndex,
							endIndex: endIndex,
						});
					}
					break;
				} else {
					// Mention is within backticks, find the next occurrence
					positionTracker[mentionPattern] = startIndex + patternLength;
					startIndex = convertedHashtag.indexOf(mentionPattern, positionTracker[mentionPattern]);
				}
			}
		}
	}
	const simplifiedMentionList = mentionList.map((mention) => ({
		user_id: mention.userId,
		username: mention.username,
	}));

	return { mentionList, simplifiedMentionList, hashtagList };
};

export default useProcessMention;
