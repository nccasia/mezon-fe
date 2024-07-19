import { reactionActions } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

type MessageProps = {
	chatRef: React.RefObject<HTMLDivElement>;
	channelId: string;
	hasMoreMessage: boolean;
	loadMoreMessage: () => void;
	messages?: string[] | null;
	firstMessageId?: string;
};

export const useMessages = ({ messages, chatRef, channelId, hasMoreMessage, loadMoreMessage, firstMessageId }: MessageProps) => {
	const [isFetching, setIsFetching] = useState(false);
	const [currentChannelId, setCurrentChannelId] = useState(channelId);
	const dispatch = useDispatch();

	useEffect(() => {
		const currentChatRef = chatRef.current;
		if (!currentChatRef || isFetching) return;

		if (channelId !== currentChannelId) {
			currentChatRef.scrollTop = currentChatRef.scrollHeight;
			setCurrentChannelId(channelId);
		}
	}, [channelId, currentChannelId, isFetching, chatRef]);

	useEffect(() => {
		const currentChatRef = chatRef.current;
		if (!currentChatRef || isFetching) return;
		currentChatRef.scrollTop = currentChatRef.scrollHeight;
	}, [channelId, messages?.length]);

	useEffect(() => {
		const handleWheel = async (event: WheelEvent) => {
			dispatch(reactionActions.setUserReactionPanelState(false));
			dispatch(reactionActions.setEmojiHover(null));
			const currentChatRef = chatRef.current;
			if (!currentChatRef || isFetching) return;

			if (currentChatRef.scrollTop === 0 && !firstMessageId) {
				const previousHeight = currentChatRef.scrollHeight;
				setIsFetching(true);
				await loadMoreMessage();
				setIsFetching(false);
				currentChatRef.scrollTop = currentChatRef.scrollHeight - previousHeight;
			}
		};

		const currentChatRef = chatRef.current;
		currentChatRef?.addEventListener('wheel', handleWheel, { passive: true });
		return () => {
			currentChatRef?.removeEventListener('wheel', handleWheel);
		};
	}, [hasMoreMessage, loadMoreMessage, chatRef, isFetching]);

	return { isFetching };
};
