import { reactionActions, useAppDispatch } from '@mezon/store';
import { EmojiStorage } from '@mezon/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChannelStreamMode } from 'mezon-js';
import { useCallback, useMemo } from 'react';
export type UseMessageReactionOption = {
	currentChannelId?: string | null | undefined;
};
interface ChatReactionProps {
	isMobile?: boolean;
}

export function useChatReaction({ isMobile = false }: ChatReactionProps = {}) {
	const dispatch = useAppDispatch();
	const reactionMessageDispatch = useCallback(
		async (
			id: string,
			mode: number,
			parentId: string,
			clanId: string,
			channelId: string,
			messageId: string,
			emoji_id: string,
			emoji: string,
			count: number,
			message_sender_id: string,
			action_delete: boolean,
			is_public: boolean,
			is_parent_public: boolean
		) => {
			if (isMobile) {
				const emojiLastest: EmojiStorage = {
					emojiId: emoji_id ?? '',
					emoji: emoji ?? '',
					messageId: messageId ?? '',
					senderId: message_sender_id ?? '',
					action: action_delete ?? false
				};
				saveRecentEmojiMobile(emojiLastest);
			}

			const clanid = mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? (clanId ?? '') : '0';
			console.log('clanid: ', clanid);

			console.log({
				id,
				clanid,
				parentId,
				channelId,
				mode,
				messageId,
				emoji_id,
				emoji,
				count,
				message_sender_id,
				action_delete,
				is_public,
				is_parent_public
			});

			return dispatch(
				reactionActions.writeMessageReaction({
					id,
					clanId: clanid,
					parentId,
					channelId,
					mode,
					messageId,
					emoji_id,
					emoji,
					count,
					messageSenderId: message_sender_id,
					actionDelete: action_delete,
					isPublic: is_public,
					isParentPulic: is_parent_public
				})
			);
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			reactionMessageDispatch
		}),
		[reactionMessageDispatch]
	);
}

function saveRecentEmojiMobile(emojiLastest: EmojiStorage) {
	AsyncStorage.getItem('recentEmojis').then((storedEmojis) => {
		const emojisRecentParse = storedEmojis ? JSON.parse(storedEmojis) : [];

		const duplicateIndex = emojisRecentParse.findIndex((item: any) => {
			return item.emoji === emojiLastest.emoji && item.senderId === emojiLastest.senderId;
		});

		if (emojiLastest.action === true) {
			if (duplicateIndex !== -1) {
				emojisRecentParse.splice(duplicateIndex, 1);
			}
		} else {
			if (duplicateIndex === -1) {
				emojisRecentParse.push(emojiLastest);
			}
		}
		AsyncStorage.setItem('recentEmojis', JSON.stringify(emojisRecentParse));
	});
}
