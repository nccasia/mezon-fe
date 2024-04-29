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
	const prevInnerDivHeight = useRef<number | null>(null);

	const outerDivHeight = outerDiv.current?.clientHeight;
	const innerDivHeight = innerDiv.current?.clientHeight;
	const outerDivScrollTop = outerDiv.current?.scrollTop;

	const [outerDivHeightState, setOuterDivHeightState] = useState<number>(0);
	const [innerDivHeightState, setInnerDivHeightState] = useState<number>(0);

	const [outerDivScrollTopState, setOuterDivScrollTop] = useState<number>(0);
	const [messageToMap, setMessageToMap] = useState<IMessageWithUser[]>([]);
	const [triggerLoadMessage, setTriggerLoadMessage] = useState<boolean>(false);
	const [postNewMessageIndex, setPosNewMessageIndex] = useState<number>(0);

	// set size for outer and inner after rendered
	useEffect(() => {
		if (outerDivHeight && innerDivHeight) {
			setOuterDivHeightState(outerDivHeight);
			setInnerDivHeightState(innerDivHeight);
		}
	}, [outerDivHeight, innerDivHeight]);

	useEffect(() => {
		setMessageToMap(messages);
	}, [messages]);

	function nearestMultipleOf50(inputNumber: number): number {
		if (inputNumber <= 50) {
			return inputNumber;
		} else {
			const nearestMultiple = Math.floor(inputNumber / 50) * 50;
			return nearestMultiple === inputNumber ? nearestMultiple - 50 : nearestMultiple;
		}
	}

	useEffect(() => {
		console.log('messageToMap.length', messageToMap.length);
		if (messageToMap.length > 50) {
			let indexToScroll: number = 0;
			if (outerDiv.current && innerDiv.current) {
				indexToScroll = nearestMultipleOf50(messages.length);
				const messageToScroll = innerDiv.current.children[indexToScroll];
				if (messageToScroll) {
					messageToScroll.scrollIntoView({ behavior: 'auto', block: 'end' });
				}
			}
		} else {
			if (messageToMap.length < 50 && outerDiv.current && innerDiv.current) {
				const lastMessageElement = innerDiv.current.lastElementChild as HTMLElement;
				console.log(lastMessageElement);
				if (lastMessageElement) {
					console.log('<50');
					lastMessageElement.scrollIntoView({ behavior: 'auto' });
				}
			}
		}
	}, [messageToMap]);

	useEffect(() => {
		if (triggerLoadMessage) {
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
			<div className="relative h-full overflow-scroll border border-red-600" ref={outerDiv} onScroll={handleScroll}>
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

// useEffect(() => {
// 	if (outerDivHeight && innerDivHeight) {
// 		setOuterDivHeightState(outerDivHeight);
// 		setInnerDivHeightState(innerDivHeight);
// 	}
// }, [outerDivHeight, innerDivHeight]);

// useEffect(() => {
// 	if (outerDivScrollTopState === 0) {
// 		loadMoreMessage();
// 		setTriggerLoadMessage(true);
// 	}
// }, [outerDivScrollTopState, channelId]);

// useEffect(() => {
// 	if (scrolledToTop && messages.length > 0) {
// 		setMessageToMap(messages);
// 		setScrolledToTop(false);
// 	}
// }, [scrolledToTop, messages, innerDivHeightState, outerDivHeightState]);

// useEffect(() => {
// 	if (outerDivHeightState && innerDivHeightState !== undefined) {
// 		if (!prevInnerDivHeight.current || outerDivScrollTopState === prevInnerDivHeight.current - outerDivHeightState) {
// 			outerDiv.current?.scrollTo({
// 				top: innerDivHeightState! - outerDivHeightState!,
// 				left: 0,
// 				behavior: prevInnerDivHeight.current ? 'smooth' : 'auto',
// 			});
// 		}
// 		prevInnerDivHeight.current = innerDivHeightState;
// 	}
// }, [outerDivHeightState, innerDivHeightState]);
