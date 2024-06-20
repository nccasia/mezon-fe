import { selectDataReactionGetFromMessage, selectDataSocketUpdate } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { updateEmojiReactionData } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useClans } from './useClans';

export type UseMessageReactionOption = {
	currentChannelId?: string | null | undefined;
};

export function useChatReaction() {
	const { currentClanId } = useClans();
	const reactDataFirstGetFromMessage = useSelector(selectDataReactionGetFromMessage);
	const dataReactionSocket = useSelector(selectDataSocketUpdate);
	const combineDataServerAndSocket = [...reactDataFirstGetFromMessage, ...dataReactionSocket];
	const convertReactionToMatchInterface = updateEmojiReactionData(combineDataServerAndSocket);
	const { clientRef, sessionRef, socketRef } = useMezon();

	const reactionMessageDispatch = useCallback(
		async (
			id: string,
			mode: number,
			channelId: string,
			channelLabel: string,
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
			await socket.writeMessageReaction(id, channelId, channelLabel, mode, messageId, emoji, count, message_sender_id, action_delete);
		},
		[sessionRef, clientRef, socketRef, currentClanId],
	);
	const setTriggerUpdateReaction = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setTriggerUpdateReaction());
		},
		[dispatch],
	);
	return useMemo(
		() => ({
			reactionMessageDispatch,
			convertReactionToMatchInterface,
		}),
		[reactionMessageDispatch, convertReactionToMatchInterface],
	);
}
