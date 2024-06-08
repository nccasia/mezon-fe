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

<<<<<<< HEAD
export const useMessages = ({ chatRef, channelId, hasMoreMessage, loadMoreMessage }: MessageProps) => {
=======
export const useMessages = ({ chatRef, channelId, hasMoreMessage, loadMoreMessage, messages }: MessageProps) => {
	const dispatch = useDispatch();
>>>>>>> 91753c6addca428f403ea909a14fc23f6f697143
	const [isFetching, setIsFetching] = useState(false);
	const [currentChannelId, setCurrentChannelId] = useState(channelId);
	const hasMoreMessage2 = useSelector(selectHasMoreMessage);
	const remain = useSelector(selectQuantitiesMessageRemain);
<<<<<<< HEAD
	// useEffect(() => {
	// 	const currentChatRef = chatRef.current;
	// 	if (!currentChatRef || isFetching) return;
=======
	const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
	useEffect(() => {
		const currentChatRef = chatRef.current;
		if (!currentChatRef || isFetching) return;
>>>>>>> 91753c6addca428f403ea909a14fc23f6f697143

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

<<<<<<< HEAD
			if (currentChatRef.scrollTop === 0) {
=======
			// If scrollTop is already 0, do not allow further scrolling up
			if (currentChatRef.scrollTop === 0) {
				if (hasMoreMessage2) {
					return;
				}
				console.log(currentChatRef.scrollTop);
				console.log('r');
				setShowLoadingMessage(true);
>>>>>>> 91753c6addca428f403ea909a14fc23f6f697143
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

<<<<<<< HEAD
	return {isFetching};
=======
	return { isFetching, showLoadingMessage };
>>>>>>> 91753c6addca428f403ea909a14fc23f6f697143
};
