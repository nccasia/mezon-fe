import { getSrcEmoji } from '@mezon/utils';

type IEmojiMarkup = {
	isMessageReply: boolean;
	shortname: string;
	emojiListPNG: any;
};
export const EmojiMarkup = ({ isMessageReply, shortname, emojiListPNG }: IEmojiMarkup) => {
	const srcEmoji = getSrcEmoji(shortname, emojiListPNG);

	return isMessageReply ? `![${shortname}](${srcEmoji})` : `[:${shortname}](${srcEmoji})`;
};
