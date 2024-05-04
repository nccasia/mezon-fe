// import { useChatMessages } from '@mezon/core';
// import { selectCurrentChannel } from '@mezon/store';
// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import useOnScreen from './useOnScreen';

// const useMessages = () => {
// 	const currentChannel = useSelector(selectCurrentChannel)?.id;
// 	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId: currentChannel ?? '' });
//   const [messages, setMessages] = useState(getMessages());
// 	const [lastMessageRef, setLastMessageRef] = useState(null);
// 	const isIntersecting = useOnScreen({ current: lastMessageRef });

// 	console.log(lastMessageRef);

// 	useEffect(() => {
// 		if (isIntersecting) {
// 			setMessages(messages);
// 		}
// 	}, [isIntersecting]);

// 	return {
// 		messages,
// 		setMessages,
// 		setLastMessageRef,
// 	};
// };

// export default useMessages;

import { useChatMessages } from '@mezon/core';
import { selectCurrentChannel } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useOnScreen from './useOnScreen';

const useMessages = () => {
	const currentChannel = useSelector(selectCurrentChannel)?.id;
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId: currentChannel ?? '' });
	const [messagesLoaded, setMessages] = useState<any>([]);
	const [lastMessageRef, setLastMessageRef] = useState<HTMLDivElement | null>(null);
	const isIntersecting = useOnScreen({ current: lastMessageRef });

	const [loaded, setLoaded] = useState<boolean>(false);

	console.log(lastMessageRef);

	useEffect(() => {
		if (loaded) {
			loadMoreMessage();
			setLoaded(false);
		}
	}, [loaded]);

	useEffect(() => {
		console.log(isIntersecting);
		if (isIntersecting) {
			setLoaded(true);
			setMessages(messagesLoaded);
		}
	}, [isIntersecting]);

	return {
		messages,
		setMessages,
		setLastMessageRef,
	};
};

export default useMessages;
