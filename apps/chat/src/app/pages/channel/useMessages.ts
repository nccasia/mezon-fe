import { useChatMessages } from '@mezon/core';
import { selectCurrentChannelId } from '@mezon/store';
import faker from 'faker';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const getMessages = () => {
	const data = [];
	for (let x = 0; x < 20; x++) {
		data.push({
			id: faker.datatype.uuid(),
			message: faker.lorem.words(Math.floor(Math.random() * 10) + 1),
			in: faker.datatype.boolean(),
		});
	}

	return data;
};

const useMessages = () => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const [lastMessageRef, setLastMessageRef] = useState(false);
	// const isIntersecting = useOnScreen({ current: lastMessageRef });
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId: currentChannelId ?? '' });
	const [triggerMessage, setTriggerMessage] = useState<boolean>(false);
	const [messagesLoaded, setMessages] = useState<any>([]);

	// useEffect(() => {
	// 	loadMoreMessage();
	// }, [currentChannelId]);

	useEffect(() => {
		if (lastMessageRef) {
			loadMoreMessage();
			// setTriggerMessage(true);
		}
	}, [lastMessageRef]);

	// useEffect(() => {
	// 	if (triggerMessage) {
	// 		setMessages(messages);
	// 	}
	// }, [triggerMessage, messages]);

	return {
		// messagesLoaded,
		setMessages,
		setLastMessageRef,
	};
};

export default useMessages;
