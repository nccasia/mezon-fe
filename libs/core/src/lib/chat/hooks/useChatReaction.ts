import {
	reactionActions,
	selectAllMessages,
	selectDataReactionCombine,
	selectMessageReacted,
	selectReactionBottomState,
	selectReactionPlaceActive,
	selectReactionRightState,
	selectUserReactionPanelState,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { EmojiDataOptionals, EmojiPlaces } from '@mezon/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import { useClans } from './useClans';

export type UseMessageReactionOption = {
	currentChannelId?: string | null | undefined;
};

export function useChatReaction() {
	const { currentClanId } = useClans();
	const dispatch = useDispatch();
	const reactionRightState = useSelector(selectReactionRightState);
	const reactionBottomState = useSelector(selectReactionBottomState);
	const dataReactionServerAndSocket = useSelector(selectDataReactionCombine);
	const reactionPlaceActive = useSelector(selectReactionPlaceActive);
	const userReactionPanelState = useSelector(selectUserReactionPanelState);
	const messages = useSelector(selectAllMessages);
	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();
	const { userId } = useAuth();
	const dataSocketAction = useSelector(selectMessageReacted);

	const reactionMessageDispatch = useCallback(
		async (id: string, mode: number, messageId: string, emoji: string, count: number, message_sender_id: string, action_delete: boolean) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			const channel = channelRef.current;
			if (!client || !session || !socket || !channel || !currentClanId) {
				throw new Error('Client is not initialized');
			}
			await socket.writeMessageReaction(id, channel.id, channel.chanel_label, mode, messageId, emoji, count, message_sender_id, action_delete);
		},
		[sessionRef, clientRef, socketRef, channelRef, currentClanId],
	);

	const reactionData: EmojiDataOptionals[] = messages.flatMap((message) => {
		if (!message.reactions) return [];
		const emojiDataItems: Record<string, EmojiDataOptionals> = {};
		message.reactions.forEach((reaction) => {
			const key = `${message.id}_${reaction.sender_id}_${reaction.emoji}`;

			if (!emojiDataItems[key]) {
				emojiDataItems[key] = {
					id: reaction.id,
					emoji: reaction.emoji,
					senders: [
						{
							sender_id: reaction.sender_id,
							count: reaction.count,
							emojiIdList: [],
							sender_name: '',
							avatar: '',
						},
					],
					channel_id: message.channel_id,
					message_id: message.id,
				};
			} else {
				const existingItem = emojiDataItems[key];

				if (existingItem.senders.length > 0) {
					existingItem.senders[0].count = reaction.count;
				}
			}
		});
		return Object.values(emojiDataItems);
	});

	const updateEmojiReactionData = (data: any[]) => {
		const dataItemReaction: Record<string, EmojiDataOptionals> = {};
		data &&
			data.forEach((item) => {
				const key = `${item.emoji}_${item.channel_id}_${item.message_id}`;
				if (!dataItemReaction[key]) {
					dataItemReaction[key] = {
						id: item.id,
						emoji: item.emoji,
						senders: [
							{
								sender_id: item.senders[0]?.sender_id ?? '',
								count: item.senders[0]?.count ?? 0,
								emojiIdList: [],
								sender_name: '',
								avatar: '',
							},
						],
						channel_id: item.channel_id,
						message_id: item.message_id,
					};
				} else {
					const existingItem = dataItemReaction[key];
					const senderIndex = existingItem.senders.findIndex((sender) => sender.sender_id === item.senders[0]?.sender_id);

					if (senderIndex !== -1) {
						existingItem.senders[senderIndex].count += item.senders[0]?.count ?? 0;
					} else {
						existingItem.senders.push({
							sender_id: item.senders[0]?.sender_id ?? '',
							count: item.senders[0]?.count ?? 0,
							emojiIdList: [],
							sender_name: '',
							avatar: '',
						});
					}
				}
			});
		return Object.values(dataItemReaction);
	};

	// const dataReactionCombine = updateEmojiReactionData([...reactionData]);

	const [dataReactionCombine, setDataCombine] = useState<EmojiDataOptionals[]>(updateEmojiReactionData(reactionData));

	useEffect(() => {
		if (dataSocketAction.action === undefined || dataSocketAction.action === false) {
			const { action, ...newStateReaction } = dataSocketAction;
			reactionData.push(newStateReaction);
			setDataCombine(updateEmojiReactionData(reactionData));
		} else if (dataSocketAction.action) {
			const { action, ...newStateReaction } = dataSocketAction;
			console.log(dataReactionCombine);

			const removedReactionData = dataReactionCombine.filter(
				(item) =>
					item.emoji !== newStateReaction.emoji ||
					item.channel_id !== newStateReaction.channel_id ||
					item.message_id !== newStateReaction.message_id ||
					item.senders[0].sender_id !== newStateReaction.senders[0].sender_id,
			);
			setDataCombine(removedReactionData);
		}
	}, [dataSocketAction]);

	// const dataReactionSocket = updateEmojiReactionData([...dataReactionServerAndSocket]);

	const setDataReactionFromServe = useCallback(
		(state: EmojiDataOptionals[]) => {
			dispatch(reactionActions.setDataReactionFromServe(state));
		},
		[dispatch],
	);

	const setReactionPlaceActive = useCallback(
		(state: EmojiPlaces) => {
			dispatch(reactionActions.setReactionPlaceActive(state));
		},
		[dispatch],
	);

	const setReactionRightState = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setReactionRightState(state));
		},
		[dispatch],
	);
	const setReactionBottomState = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setReactionBottomState(state));
		},
		[dispatch],
	);

	const setUserReactionPanelState = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setUserReactionPanelState(state));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			reactionActions,
			userId,
			setDataReactionFromServe,
			reactionMessageDispatch,
			setReactionPlaceActive,
			reactionPlaceActive,
			reactionRightState,
			reactionBottomState,
			dataReactionServerAndSocket,
			dataReactionCombine,
			setReactionRightState,
			setReactionBottomState,
			setUserReactionPanelState,
			userReactionPanelState,
			reactionData,
			// dataReactionSocket,
		}),
		[
			reactionActions,
			userId,
			setDataReactionFromServe,
			reactionMessageDispatch,
			setReactionPlaceActive,
			reactionPlaceActive,
			reactionRightState,
			reactionBottomState,
			dataReactionServerAndSocket,
			dataReactionCombine,
			setReactionRightState,
			setReactionBottomState,
			reactionData,
			// dataReactionSocket,
		],
	);
}
