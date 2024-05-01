import { useChatMessages } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import { ChannelMessage } from './ChannelMessage';

export const ScrollContainerMessage = ({
	children,
	scrollCta,
	channelId,
	mode,
	channelLabel,
	messages,
	lastMessageId,
	unreadMessageId,
	hasMoreMessage,
}: any) => {
	const { loadMoreMessage } = useChatMessages({ channelId });

	const outerDiv = useRef<HTMLDivElement | null>(null);
	const innerDiv = useRef<HTMLDivElement | null>(null);

	// const outerDivHeight = outerDiv.current?.clientHeight;
	// const innerDivHeight = innerDiv.current?.clientHeight;

	// const [outerDivHeightState, setOuterDivHeightState] = useState<number>(0);
	// const [innerDivHeightState, setInnerDivHeightState] = useState<number>(0);

	// const [outerDivScrollTopState, setOuterDivScrollTop] = useState<number>(0);
	const [messageToMap, setMessageToMap] = useState<IMessageWithUser[]>([]);
	const [triggerLoadMessage, setTriggerLoadMessage] = useState<boolean>(false);
	// const [postNewMessageIndex, setPosNewMessageIndex] = useState<number>(0);

	// set size for outer and inner after rendered
	// useEffect(() => {
	// 	if (outerDivHeight && innerDivHeight) {
	// 		setOuterDivHeightState(outerDivHeight);
	// 		setInnerDivHeightState(innerDivHeight);
	// 	}
	// }, [outerDivHeight, innerDivHeight]);

	useEffect(() => {
		setMessageToMap(messages);
	}, [messages]);

	useEffect(() => {
		if (messageToMap.length > 50 && hasMoreMessage) {
			if (outerDiv.current && innerDiv.current) {
				const messageToScroll = innerDiv.current.children[50];
				if (messageToScroll) {
					messageToScroll.scrollIntoView({ behavior: 'auto', block: 'end' });
				}
			}
		}
	}, [messageToMap]);

	useEffect(() => {
		if (triggerLoadMessage && messages.length > 0) {
			setMessageToMap(messages);
			setTriggerLoadMessage(false);
		}
	}, [triggerLoadMessage, messages]);

	const handleScroll = (e: any) => {
		if (e.target.scrollTop === 0 && hasMoreMessage) {
			loadMoreMessage();
			setTriggerLoadMessage(true);
		}
	};

	return (
		<div className="relative h-full">
			<div className="relative h-full overflow-scroll border border-red-600 overflow-x-hidden" ref={outerDiv} onScroll={handleScroll}>
				<div className="relative transition-all duration-300 border border-green-600" ref={innerDiv}>
					{messageToMap &&
						messageToMap.map((message, i) => (
							<ChannelMessage
								mode={mode}
								key={message.id}
								lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
								message={message}
								preMessage={messages.length > 0 ? messages[i - 1] : undefined}
								channelId={channelId}
								channelLabel={channelLabel || ''}
							/>
						))}
				</div>
			</div>
		</div>
	);
};

export default ScrollContainerMessage;
