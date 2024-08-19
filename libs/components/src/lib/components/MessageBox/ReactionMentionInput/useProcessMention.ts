import { ETypeMEntion, IEmojiOnMessage, IHashtagOnMessage, IMentionOnMessage, IRoleMention } from '@mezon/utils';
import { MentionItem } from 'react-mentions';

const useProcessMention = (mentionsRaw: MentionItem[], roleList: IRoleMention[]) => {
	const mentions: IMentionOnMessage[] = [];
	const hashtags: IHashtagOnMessage[] = [];
	const emojis: IEmojiOnMessage[] = [];
	mentionsRaw.forEach((item) => {
		const { id, display, plainTextIndex, childIndex } = item;
		const s = plainTextIndex;
		const e = plainTextIndex + display.length;
		const isRole = roleList.some((role) => role.roleId === id);

		if (childIndex === ETypeMEntion.MENTION) {
			if (isRole) {
				mentions.push({
					role_id: id,
					s,
					e,
				});
			} else {
				mentions.push({
					user_id: id,
					s,
					e,
				});
			}
		} else if (childIndex === ETypeMEntion.HASHTAG) {
			hashtags.push({
				channelid: id,
				s,
				e,
			});
		} else if (childIndex === ETypeMEntion.EMOJI) {
			emojis.push({
				emojiid: id,
				s,
				e,
			});
		}
	});
	return {
		mentionList: mentions,
		hashtagList: hashtags,
		emojiList: emojis,
	};
};

export default useProcessMention;
