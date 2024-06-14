import {
	reactionActions,
	selectArrowPosition,
	selectDataReactionCombine,
	selectMessageMatchWithRef,
	selectPositionEmojiButtonSmile,
	selectReactionBottomState,
	selectReactionBottomStateResponsive,
	selectReactionPlaceActive,
	selectReactionRightState,
	selectTriggerUpdateReaction,
	selectUserReactionPanelState,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { EmojiDataOptionals, EmojiPlaces, updateEmojiReactionData } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
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
	const reactionBottomStateResponsive = useSelector(selectReactionBottomStateResponsive);
	const messageMatchWithRefStatus = useSelector(selectMessageMatchWithRef);
	const positionOfSmileButton = useSelector(selectPositionEmojiButtonSmile);
	const arrowPosition = useSelector(selectArrowPosition);
	const triggerUpdateReaction = useSelector(selectTriggerUpdateReaction);

	const { clientRef, sessionRef, socketRef, channelRef } = useMezon();
	const { userId } = useAuth();

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

	const dataReactionCombine = updateEmojiReactionData(dataReactionServerAndSocket);

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

	const setReactionBottomStateResponsive = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setReactionBottomStateResponsive(state));
		},
		[dispatch],
	);

	const setUserReactionPanelState = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setUserReactionPanelState(state));
		},
		[dispatch],
	);

	const setMessageMatchWithRef = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setMessageMatchWithRef(state));
		},
		[dispatch],
	);
	const setPositionOfSmileButton = useCallback(
		(state: any) => {
			dispatch(reactionActions.setPositionOfSmileButton(state));
		},
		[dispatch],
	);
	const setArrowPosition = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setArrowPosition(state));
		},
		[dispatch],
	);
	const setTriggerUpdateReaction = useCallback(
		(state: boolean) => {
			dispatch(reactionActions.setTriggerUpdateReaction());
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
			setReactionBottomStateResponsive,
			reactionBottomStateResponsive,
			messageMatchWithRefStatus,
			setMessageMatchWithRef,
			setPositionOfSmileButton,
			positionOfSmileButton,
			arrowPosition,
			setArrowPosition,
			setTriggerUpdateReaction,
			triggerUpdateReaction,
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
			setReactionBottomStateResponsive,
			reactionBottomStateResponsive,
			messageMatchWithRefStatus,
			setMessageMatchWithRef,
			setPositionOfSmileButton,
			positionOfSmileButton,
			arrowPosition,
			setArrowPosition,
			setTriggerUpdateReaction,
			triggerUpdateReaction,
		],
	);
}
