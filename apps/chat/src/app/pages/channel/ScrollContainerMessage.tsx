import { useChatMessages } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { ChannelMessage } from './ChannelMessage';
import { useWindowResize } from './useResize';

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

	const Row = ({ data, index, setSize, windowWidth }: any) => {
		const rowRef = useRef<HTMLDivElement>(null); // Correct type for rowRef
		useEffect(() => {
			if (rowRef.current) {
				setSize(index, rowRef.current.getBoundingClientRect().height);
			}
		}, [setSize, index, windowWidth]); // Ensure windowWidth is defined in your component
		return (
			<div ref={rowRef}>
				{data[index] && (
					<ChannelMessage
						mode={mode}
						key={data[index].id}
						lastSeen={data[index].id === unreadMessageId && data[index].id !== lastMessageId}
						message={data[index]}
						preMessage={index > 0 ? data[index][index - 1] : undefined}
						channelId={channelId}
						channelLabel={channelLabel || ''}
					/>
				)}
			</div>
		);
	};

	const listRef = useRef<List>(null); // Correct type for listRef
	const sizeMap = useRef<{ [key: number]: number }>({}); // Correct type for sizeMap
	const setSize = useCallback((index: any, size: any) => {
		sizeMap.current = { ...sizeMap.current, [index]: size };
		listRef?.current?.resetAfterIndex(index);
	}, []);
	console.log(setSize);
	const getSize = (index: number) => sizeMap.current[index] || 50;
	const [windowWidth] = useWindowResize();

	return (
		<List ref={listRef} height={600} width="100%" itemCount={messages.length} itemSize={getSize} itemData={messages}>
			{({ data, index, style }) => (
				<div style={style}>
					<Row data={data} index={index} setSize={setSize} windowWidth={windowWidth} />
				</div>
			)}
		</List>
	);
};

export default ScrollContainerMessage;
