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

export const useMessages = ({ chatRef, channelId, hasMoreMessage, loadMoreMessage, messages }: MessageProps) => {
	const dispatch = useDispatch();
	const [isFetching, setIsFetching] = useState(false);
	const [currentChannelId, setCurrentChannelId] = useState(channelId);
	const hasMoreMessage2 = useSelector(selectHasMoreMessage);
	const remain = useSelector(selectQuantitiesMessageRemain);
	const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
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
	}, [channelId, messages.length]);

	useEffect(() => {
		const handleWheel = async (event: WheelEvent) => {
			const currentChatRef = chatRef.current;
			if (!currentChatRef || isFetching) return;

			// If scrollTop is already 0, do not allow further scrolling up
			if (currentChatRef.scrollTop === 0) {
				if (hasMoreMessage2) {
					return;
				}
				console.log(currentChatRef.scrollTop);
				console.log('r');
				setShowLoadingMessage(true);
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

	return { isFetching, showLoadingMessage };
};
