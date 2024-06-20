import { ChatWelcome } from '@mezon/components';
import { getJumpToMessageId, useApp, useJumpToMessage, useMessages, useNotification, useReference } from '@mezon/core';
import {
	messagesActions,
	selectHasMoreMessageByChannelId,
	selectMessageIdsByChannelIdV2,
	selectQuantitiesMessageRemain,
	useAppDispatch,
} from '@mezon/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChannelMessage, MemorizedChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const messages = useSelector((state) => selectMessageIdsByChannelIdV2(state, channelId));
	const chatRef = useRef<HTMLDivElement>(null);
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const [messageid, setMessageIdToJump] = useState(getJumpToMessageId());
	const [timeToJump, setTimeToJump] = useState(1000);
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('center');
	const { jumpToMessage } = useJumpToMessage();
	const { idMessageRefReply, idMessageToJump, messageMentionId } = useReference();
	const { appearanceTheme } = useApp();
	const { idMessageNotifed } = useNotification();
	const remain = useSelector(selectQuantitiesMessageRemain);
	// share logic to load more message

	const dispatch = useAppDispatch();

	const loadMoreMessage = useCallback(async () => {
		return await dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	const { isFetching } = useMessages({ chatRef, hasMoreMessage, loadMoreMessage, channelId, messages });

	useEffect(() => {
		if (messageMentionId) setMessageIdToJump(messageMentionId);
	}, [messageMentionId]);

	useEffect(() => {
		if (idMessageNotifed || idMessageNotifed === '') setMessageIdToJump(idMessageNotifed);
		if (idMessageRefReply !== '') setMessageIdToJump(idMessageRefReply);
		if (idMessageToJump !== '') setMessageIdToJump(idMessageToJump);
		setTimeToJump(0);
		setPositionToJump('center');
	}, [idMessageNotifed, idMessageRefReply, idMessageToJump]);

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
	}, [messageid, jumpToMessage, timeToJump, positionToJump]);

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

			{messages?.map((messageId) => {
				return (
					<MemorizedChannelMessage
						key={messageId}
						messageId={messageId}
						channelId={channelId}
						mode={mode}
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
