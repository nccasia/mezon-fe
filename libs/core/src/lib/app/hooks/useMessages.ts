import { selectHasMoreMessage, selectQuantitiesMessageRemain } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type MessageProps = {
	chatRef: React.RefObject<HTMLDivElement>;
	channelId: string;
	hasMoreMessage: boolean;
	loadMoreMessage: () => void;
	messages: IMessageWithUser[];
};

export const useMessages = ({ chatRef, channelId, hasMoreMessage, loadMoreMessage }: MessageProps) => {
	const [isFetching, setIsFetching] = useState(false);
	const [currentChannelId, setCurrentChannelId] = useState(channelId);
	const hasMoreMessage2 = useSelector(selectHasMoreMessage);
	const remain = useSelector(selectQuantitiesMessageRemain);
	// useEffect(() => {
	// 	const currentChatRef = chatRef.current;
	// 	if (!currentChatRef || isFetching) return;

	// 	if (channelId !== currentChannelId) {
	// 		currentChatRef.scrollTop = currentChatRef.scrollHeight;
	// 		setCurrentChannelId(channelId);
	// 	}
	// }, [channelId, currentChannelId, isFetching, chatRef]);

	useEffect(() => {
		const currentChatRef = chatRef.current;
		if (!currentChatRef || isFetching) return;
		currentChatRef.scrollTop = currentChatRef.scrollHeight;
	}, [channelId]);

	useEffect(() => {
		const handleWheel = async (event: WheelEvent) => {
			const currentChatRef = chatRef.current;
			if (!currentChatRef || isFetching) return;

			if (currentChatRef.scrollTop === 0) {
				const previousHeight = currentChatRef.scrollHeight;
				setIsFetching(true);
				await loadMoreMessage();
				setIsFetching(false);
				currentChatRef.scrollTop = currentChatRef.scrollHeight - previousHeight;
				setShowLoadingMessage(false);
			}
		};

		const currentChatRef = chatRef.current;
		currentChatRef?.addEventListener('wheel', handleWheel, { passive: true });
		return () => {
			currentChatRef?.removeEventListener('wheel', handleWheel);
		};
	}, [loadMoreMessage, chatRef, isFetching, hasMoreMessage2]);

	return {isFetching};
};
