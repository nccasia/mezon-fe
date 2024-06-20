import {
	selectAllChannels,
	selectAllThreads,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectIsPrivate,
	selectIsShowCreateThread,
	selectListThreadId,
	selectMessageThreadError,
	selectNameThreadError,
	selectNameValueThread,
	selectValueThread,
	threadsActions,
	useAppDispatch,
} from '@mezon/store';
import { IMessageWithUser, isGreaterOneMonth } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useThreads() {
	const dispatch = useAppDispatch();
	const threads = useSelector(selectAllThreads);
	const channels = useSelector(selectAllChannels);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const isPrivate = useSelector(selectIsPrivate);
	const nameThreadError = useSelector(selectNameThreadError);
	const messageThreadError = useSelector(selectMessageThreadError);
	const listThreadId = useSelector(selectListThreadId);
	const isShowCreateThread = useSelector(selectIsShowCreateThread(currentChannelId as string));
	const nameValueThread = useSelector(selectNameValueThread(currentChannelId as string));
	const valueThread = useSelector(selectValueThread);

	const setTurnOffThreadMessage = useCallback(() => {
		setOpenThreadMessageState(false);
		setValueThread(null);
	}, [dispatch]);

	const setOpenThreadMessageState = useCallback(
		(value: boolean) => {
			dispatch(threadsActions.setOpenThreadMessageState(value));
		},
		[dispatch],
	);

	const setIsShowCreateThread = useCallback(
		(isShowCreateThread: boolean, channelId?: string) => {
			dispatch(threadsActions.setIsShowCreateThread({ channelId: channelId ? channelId : (currentChannelId as string), isShowCreateThread }));
		},
		[currentChannelId, dispatch],
	);

	const setNameValueThread = useCallback(
		(nameValue: string) => {
			dispatch(threadsActions.setNameValueThread({ channelId: currentChannelId as string, nameValue }));
		},
		[currentChannelId, dispatch],
	);

	const setValueThread = useCallback(
		(value: IMessageWithUser | null) => {
			dispatch(threadsActions.setValueThread(value));
		},
		[dispatch],
	);

	const threadChannel = useMemo(() => {
		const threads = channels.filter((channel) => {
			if (currentChannel && currentChannel.parrent_id !== '0') {
				return channel.parrent_id === currentChannel.parrent_id;
			}
			if (currentChannel && currentChannel.parrent_id === '0') {
				return channel.parrent_id === currentChannelId;
			}
		});
		return threads;
	}, [channels, currentChannel, currentChannelId]);

	const threadChannelOld = useMemo(() => {
		return threadChannel.filter((thread) => isGreaterOneMonth(thread.last_sent_message?.timestamp as string) > 30);
	}, [threadChannel]);

	const threadChannelOnline = useMemo(() => {
		return threadChannel.filter((thread) => isGreaterOneMonth(thread.last_sent_message?.timestamp as string) <= 30);
	}, [threadChannel]);

	const threadCurrentChannel = useMemo(() => {
		if (listThreadId && currentChannelId) {
			return channels.find((channel) => channel.channel_id === listThreadId[currentChannelId]);
		}
	}, [channels, currentChannelId, listThreadId]);

	return useMemo(
		() => ({
			threads,
			threadChannel,
			isShowCreateThread,
			isPrivate,
			nameThreadError,
			messageThreadError,
			threadChannelOld,
			threadChannelOnline,
			threadCurrentChannel,
			nameValueThread,
			valueThread,
			setIsShowCreateThread,
			setNameValueThread,
			setValueThread,
			setOpenThreadMessageState,
			setTurnOffThreadMessage,
		}),
		[
			isPrivate,
			isShowCreateThread,
			messageThreadError,
			nameThreadError,
			nameValueThread,
			threadChannel,
			threadChannelOld,
			threadChannelOnline,
			threadCurrentChannel,
			threads,
			valueThread,
			setNameValueThread,
			setIsShowCreateThread,
			setValueThread,
			setOpenThreadMessageState,
			setTurnOffThreadMessage,
		],
	);
}
