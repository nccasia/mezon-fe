import { useMezon } from '@mezon/transport';
import { useCallback, useMemo } from 'react';
import { useClans } from './useClans';

export type UseMessageReactionOption = {
	currentChannelId?: string | null | undefined;
};

export function useChatReaction() {
	const { currentClanId } = useClans();
	const { clientRef, sessionRef, socketRef } = useMezon();

	const reactionMessageDispatch = useCallback(
		async (
			id: string,
			mode: number,
			channelId: string,
			messageId: string,
			emoji: string,
			count: number,
			message_sender_id: string,
			action_delete: boolean,
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !currentClanId) {
				throw new Error('Client is not initialized');
			}
			await socket.writeMessageReaction(id, channelId, mode, messageId, emoji, count, message_sender_id, action_delete);
		},
		[sessionRef, clientRef, socketRef, currentClanId],
	);

	return useMemo(
		() => ({
			reactionMessageDispatch,
		}),
		[reactionMessageDispatch],
	);
}
