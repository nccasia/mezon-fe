import { useChatMessages } from '@mezon/core';
import { useEffect, useRef, useState } from 'react';
import { ChannelMessage } from './ChannelMessage';

export const ScrollContainerMessage = ({ children, scrollCta, channelId, mode, channelLabel }: any) => {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId: channelId });

	useEffect(() => {
		loadMoreMessage();
		setTriggerLoadMessage(true);
	}, [channelId]);

	const outerDiv = useRef<HTMLDivElement | null>(null);
	const innerDiv = useRef<HTMLDivElement | null>(null);
	const prevInnerDivHeight = useRef<number | null>(null);

	const outerDivHeight = outerDiv.current?.clientHeight;
	const innerDivHeight = innerDiv.current?.clientHeight;
	const outerDivScrollTop = outerDiv.current?.scrollTop;

	const [outerDivHeightState, setOuterDivHeightState] = useState<number>(0);
	const [innerDivHeightState, setInnerDivHeightState] = useState<number>(0);

	useEffect(() => {
		if (outerDivHeight && innerDivHeight) {
			setOuterDivHeightState(outerDivHeight);
			setInnerDivHeightState(innerDivHeight);
		}
	}, [outerDivHeight, innerDivHeight]);

	const [outerDivScrollTopState, setOuterDivScrollTop] = useState<number>(outerDivScrollTop ?? 0);
	const [messageToMap, setMessageToMap] = useState(messages);
	const [triggerLoadMessage, setTriggerLoadMessage] = useState<boolean>(false);

	console.log(outerDivHeight);
	console.log(innerDivHeight);
	console.log(outerDivScrollTopState);

	useEffect(() => {
		if (outerDivScrollTopState === 0) {
			loadMoreMessage();
			setTriggerLoadMessage(true);
		}
	}, [outerDivScrollTopState, channelId]);

	useEffect(() => {
		if (triggerLoadMessage && messages.length > 0) {
			setMessageToMap(messages);
			setTriggerLoadMessage(false);
			outerDiv.current?.scrollTo({
				top: innerDivHeightState! - outerDivHeightState!,
				left: 0,
				behavior: 'smooth',
			});
		}
	}, [triggerLoadMessage, messages, innerDivHeightState, outerDivHeightState]);

	useEffect(() => {
		if (outerDivHeightState && innerDivHeightState !== undefined) {
			if (!prevInnerDivHeight.current || outerDivScrollTopState === prevInnerDivHeight.current - outerDivHeightState) {
				outerDiv.current?.scrollTo({
					top: innerDivHeightState! - outerDivHeightState!,
					left: 0,
					behavior: prevInnerDivHeight.current ? 'smooth' : 'auto',
				});
			}
			prevInnerDivHeight.current = innerDivHeightState;
		}
	}, [outerDivHeightState, innerDivHeightState]);

	const handleScroll = (e: any) => {
		console.log('innerDivHeightState', innerDivHeightState!);
		console.log('outerDivHeightState', outerDivHeightState!);
		console.log(innerDivHeightState! - outerDivHeightState!);
		setOuterDivScrollTop(e.target.scrollTop);
	};

	return (
		<div className="relative h-full">
			<div className="relative h-full overflow-scroll border border-red-600" ref={outerDiv} onScroll={handleScroll}>
				<div className="relative transition-all duration-300 border border-green-600" ref={innerDiv}>
					{messageToMap.map((message, i) => (
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
