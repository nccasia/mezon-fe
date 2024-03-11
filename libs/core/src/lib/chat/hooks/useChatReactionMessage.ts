import { selectMessageReacted } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useClans } from './useClans';

export type UseMessageReactionOption = {
	currentChannelId: string | null | undefined;
};

export function useChatReactionMessage({ currentChannelId }: UseMessageReactionOption) {
	const { currentClanId } = useClans();
	const messageDataReactedFromSocket = useSelector(selectMessageReacted);
	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();
	const reactionMessage = useCallback(
		async (emojiId: string, channelId: string, messageId: string, emoji: string, message_sender_id: string, action_delete: boolean) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;

			console.log('session', session);
			console.log('client', session);
			console.log('socket', socket);
			console.log('channel', channel);

			if (!client || !session || !socket || !channel || !currentClanId) {
				throw new Error('Client is not initialized');
			}
			await socket.writeMessageReaction(emojiId, channelId, messageId, emoji, message_sender_id, action_delete);
		},
		[sessionRef, clientRef, socketRef, channelRef, currentClanId],
	);

	const reactionMessageAction = useCallback(
		async (emojiId: string, channelId: string, messageId: string, emoji: string, message_sender_id: string, action_delete: boolean) => {
			try {
				await reactionMessage(emojiId, channelId, messageId, emoji, message_sender_id, action_delete);
			} catch (error) {
				console.error('Error reacting to message:', error);
			}
		},
		[reactionMessage],
	);

	return useMemo(
		() => ({
			reactionMessage,
			reactionMessageAction,
			messageDataReactedFromSocket,
		}),
		[reactionMessage, reactionMessageAction, messageDataReactedFromSocket],
	);
}
