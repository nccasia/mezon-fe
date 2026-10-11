import {
	selectAnonymousMode,
	selectCurrentChannelId,
	selectCurrentTopicInitMessage,
	selectIsShowCreateTopic,
	selectMessageTopicError,
	threadsActions,
	toastActions,
	topicsActions,
	useAppDispatch
} from '@mezon/store';
import type { IMessageWithUser } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export function useTopics() {
	const dispatch = useAppDispatch();
	const { t: tMessage } = useTranslation('message');
	const currentChannelId = useSelector(selectCurrentChannelId);
	const anonymousMode = useSelector((state) => selectAnonymousMode(state, currentChannelId as string));
	const messageTopicError = useSelector(selectMessageTopicError);
	const isShowCreateTopic = useSelector(selectIsShowCreateTopic);
	const currentTopicInitMessage = useSelector(selectCurrentTopicInitMessage);

	const setTurnOffTopicMessage = useCallback(() => {
		setOpenTopicMessageState(false);
		setCurrentTopicInitMessage(null);
	}, [dispatch]);

	const setOpenTopicMessageState = useCallback(
		(value: boolean) => {
			dispatch(topicsActions.setOpenTopicMessageState(value));
		},
		[dispatch]
	);

	const setIsShowCreateTopic = useCallback(
		(isShowCreateTopic: boolean) => {
			dispatch(topicsActions.setIsShowCreateTopic(isShowCreateTopic));
		},
		[currentChannelId, dispatch]
	);

	const setCurrentTopicInitMessage = useCallback(
		(value: IMessageWithUser | null) => {
			dispatch(topicsActions.setCurrentTopicInitMessage(value));
		},
		[dispatch]
	);

	const startCreateTopicFromMessage = useCallback(
		(message: IMessageWithUser, initMessage?: IMessageWithUser | null) => {
			if (anonymousMode) {
				dispatch(
					toastActions.addToast({
						message: tMessage('turnOffAnonymousToCreateTopic'),
						type: 'error'
					})
				);
				return;
			}

			const channelId = (message.channel_id as string) || (currentChannelId as string);
			dispatch(topicsActions.setIsShowCreateTopic(true));
			dispatch(threadsActions.setIsShowCreateThread({ channelId, isShowCreateThread: false }));
			dispatch(topicsActions.setOpenTopicMessageState(true));
			dispatch(topicsActions.setCurrentTopicInitMessage(initMessage ?? message));
			dispatch(topicsActions.setCurrentTopicId(''));
			dispatch(topicsActions.setInitTopicMessageId(message.id));
		},
		[anonymousMode, currentChannelId, dispatch, tMessage]
	);

	return useMemo(
		() => ({
			isShowCreateTopic,
			messageTopicError,
			currentTopicInitMessage,
			setIsShowCreateTopic,
			setCurrentTopicInitMessage,
			setOpenTopicMessageState,
			setTurnOffTopicMessage,
			startCreateTopicFromMessage
		}),
		[
			isShowCreateTopic,
			messageTopicError,
			currentTopicInitMessage,
			setIsShowCreateTopic,
			setCurrentTopicInitMessage,
			setOpenTopicMessageState,
			setTurnOffTopicMessage,
			startCreateTopicFromMessage
		]
	);
}
