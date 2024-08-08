import { IMessageSendPayload } from '@mezon/utils';

export const useFilteredContent = (content: IMessageSendPayload) => {
	const filterContent = (content: IMessageSendPayload) => {
		// Build the result object, excluding empty arrays and empty strings
		const result: Partial<IMessageSendPayload> = {};

		if (content?.t?.trim() !== '') {
			result.t = content.t;
		}
		if (content.emojis && content.emojis.length > 0) {
			result.emojis = content.emojis;
		}
		if (content.hashtags && content.hashtags.length > 0) {
			result.hashtags = content.hashtags;
		}
		if (content.links && content.links.length > 0) {
			result.links = content.links;
		}
		if (content.markdowns && content.markdowns.length > 0) {
			result.markdowns = content.markdowns;
		}
		if (content.mentions && content.mentions.length > 0) {
			result.mentions = content.mentions;
		}
		if (content.voicelinks && content.voicelinks.length > 0) {
			result.voicelinks = content.voicelinks;
		}

		// Return undefined if the result is empty
		return Object.keys(result).length > 0 ? (result as IMessageSendPayload) : undefined;
	};

	return filterContent(content);
};
