import { useChatMessages } from '@mezon/core';
import { useEffect, useRef, useState } from 'react';
import { ChannelMessage } from './ChannelMessage';

export const ScrollContainerMessage = ({ children, scrollCta, channelId, mode, channelLabel }: any) => {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId: channelId });

	useEffect(() => {
		loadMoreMessage();
		setTriggerLoadMessage(true);
	}, []);

	const outerDiv = useRef<HTMLDivElement | null>(null);
	const innerDiv = useRef<HTMLDivElement | null>(null);
	const prevInnerDivHeight = useRef<number | null>(null);
	const outerDivHeight = outerDiv.current?.clientHeight;
	const innerDivHeight = innerDiv.current?.clientHeight;
	const outerDivScrollTop = outerDiv.current?.scrollTop;

	const [outerDivHeightState, setOuterDivHeightState] = useState<number>(outerDivHeight ?? 0);
	const [innerDivHeightState, setInnerDivHeightState] = useState<number>(innerDivHeight ?? 0);
	const [outerDivScrollTopState, setOuterDivScrollTop] = useState<number>(outerDivScrollTop ?? 0);
	const [messageToMap, setMessageToMap] = useState(messages);
	const [triggerLoadMessage, setTriggerLoadMessage] = useState<boolean>(false);

	useEffect(() => {
		if (outerDivScrollTopState === 0) {
			console.log(outerDivScrollTopState);
			loadMoreMessage();
			setTriggerLoadMessage(true);
		}
	}, [outerDivScrollTopState]); // Only listen to changes in outerDivScrollTopState

	useEffect(() => {
		console.log(messages);
		if (triggerLoadMessage && messages.length > 0) {
			setMessageToMap(messages);
			setTriggerLoadMessage(false);
		}
	}, [triggerLoadMessage, messages]); // Update messageToMap whenever messages change

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
		setOuterDivScrollTop(e.target.scrollTop);
	};
	return (
		<div className="relative h-full">
			<div className="relative h-full overflow-scroll" ref={outerDiv} onScroll={handleScroll}>
				<div className="relative transition-all duration-300" ref={innerDiv}>
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
