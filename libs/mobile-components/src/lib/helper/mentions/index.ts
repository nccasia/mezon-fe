export const convertMentionsToText = (text: string) => {
	const mentionPattern = /{@}\[([^\]]+)\]\(\d+\)|{#}\[([^\]]+)\]\((\d+)\)|\{\:\}\[([^\]]+)\]\(([^\)]+)\)/g;

	return text.replace(mentionPattern, (match, userMention, hashtagMention, hashtagId, tagValue) => {
		if (userMention) {
			return `@${userMention}`;
		} else if (hashtagMention && hashtagId) {
			return `#${hashtagId}`;
		} else if (tagValue) {
			return `${tagValue}`;
		} else {
			return match;
		}
	});
};
export const convertMentionsToData = (text: string) => {
	const mentionPattern = /({@}|{#})\[([^\]]+)\]\((\d+)\)/g;
	const result = [];
	let match;
	while ((match = mentionPattern.exec(text)) !== null) {
		const prefix = match[1];
		const mention = match[2];
		const id = match[3];
		result.push({
			id: id,
			display: `${prefix === '{@}' ? '@' : '#'}${mention}`,
		});
	}
	return result;
};
