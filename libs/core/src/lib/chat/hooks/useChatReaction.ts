import { reactionActions, useAppDispatch } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js';
import { useCallback, useMemo } from 'react';

export type UseMessageReactionOption = {
	currentChannelId?: string | null | undefined;
};

export function useChatReaction() {
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
			console.log('------EMOJI-------');
			console.log('id', id);
			console.log('mode', mode);
			console.log('parentId: ', parentId);
			console.log('clanId: ', clanId);
			console.log('channelId: ', channelId);
			console.log('messageId: ', messageId);
			console.log('emoji_id: ', emoji_id);
			console.log('emoji: ', emoji);
			console.log('count: ', count);
			console.log('message_sender_id: ', message_sender_id);
			console.log('action_delete: ', action_delete);
			console.log('is_public: ', is_public);
			console.log('is_parent_public: ', is_parent_public);
			return dispatch(
				reactionActions.writeMessageReaction({
					id,
					clanId: mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? clanId : '',
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
