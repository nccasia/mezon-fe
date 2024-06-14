import { ChatWelcome } from '@mezon/components';
import {
	getJumpToMessageId,
	useApp,
	useChatMessages,
	useChatReaction,
	useJumpToMessage,
	useMessages,
	useNotification,
	useReference,
} from '@mezon/core';
import { selectDataReactionGetFromMessage } from '@mezon/store';
import { EmojiDataOptionals, IMessageWithUser, updateEmojiReactionData } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const chatRef = useRef<HTMLDivElement>(null);
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const [messageid, setMessageIdToJump] = useState(getJumpToMessageId());
	const [timeToJump, setTimeToJump] = useState(1000);
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('center');
	const { jumpToMessage } = useJumpToMessage();
	const { setIdReferenceMessageReply, idMessageRefReply, idMessageToJump, messageMentionId } = useReference();
	const { appearanceTheme } = useApp();
	const { idMessageNotifed, setMessageNotifedId } = useNotification();
	// share logic to load more message
	const { isFetching, remain } = useMessages({ chatRef, hasMoreMessage, loadMoreMessage, messages, channelId });

	const reactDataFirstGetFromMessage = useSelector(selectDataReactionGetFromMessage);
	const [dataReactionCombine, setDataReactionCombine] = useState<EmojiDataOptionals[]>([]);
	const { dataReactionServerAndSocket, triggerUpdateReaction, setTriggerUpdateReaction } = useChatReaction();

	useEffect(() => {
		setDataReactionCombine(updateEmojiReactionData([...reactDataFirstGetFromMessage, ...dataReactionServerAndSocket]));
	}, [triggerUpdateReaction, reactDataFirstGetFromMessage,channelId]);

	useEffect(() => {
		setMessageIdToJump(messageMentionId);
	}, [messageMentionId]);

	useEffect(() => {
		if (idMessageNotifed || idMessageNotifed === '') setMessageIdToJump(idMessageNotifed);
		if (idMessageRefReply !== '') setMessageIdToJump(idMessageRefReply);
		if (idMessageToJump !== '') setMessageIdToJump(idMessageToJump);
		setTimeToJump(0);
		setPositionToJump('center');
	}, [getJumpToMessageId, idMessageNotifed, idMessageRefReply, idMessageToJump]);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;
		if (messageid) {
			timeoutId = setTimeout(() => {
				jumpToMessage(messageid, positionToJump);
			}, timeToJump);
		}
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [messageid, jumpToMessage]);

	function reverseArray(array: IMessageWithUser[]) {
		return array.slice().reverse();
	}

	const getReactionsByChannelId = (data: EmojiDataOptionals[], mesId: string) => {
		return data.filter((item: any) => item.message_id === mesId);
	};

	return (
		<div
			className={`dark:bg-bgPrimary pb-5
			bg-bgLightPrimary
			relative h-full overflow-y-scroll
			overflow-x-hidden flex-col flex

			${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
			id="scrollLoading"
			ref={chatRef}
		>
			{remain === 0 && <ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} />}
			{isFetching && remain !== 0 && (
				<p className="font-semibold text-center dark:text-textDarkTheme text-textLightTheme">Loading messages...</p>
			)}

			{reverseArray(messages).map((message, i) => {
				const data = getReactionsByChannelId(dataReactionCombine, message.id);
				return (
					<ChannelMessage
						dataReaction={data}
						mode={mode}
						key={message.id}
						lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
						message={message}
						preMessage={reverseArray(messages).length > 0 ? reverseArray(messages)[i - 1] : undefined}
						channelId={channelId}
						channelLabel={channelLabel ?? ''}
					/>
				);
			})}
		</div>
	);
}

ChannelMessages.Skeleton = () => {
	return (
		<>
			<ChannelMessage.Skeleton />
			<ChannelMessage.Skeleton />
			<ChannelMessage.Skeleton />
		</>
	);
};
