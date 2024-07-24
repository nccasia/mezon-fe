import { ChatWelcome, MessageContextMenuProvider, MessageModalImage } from '@mezon/components';
import { getJumpToMessageId, useAppParams, useJumpToMessage, useMessages, useNotification } from '@mezon/core';
import {
	messagesActions,
	selectFirstMessageId,
	selectHasMoreMessageByChannelId,
	selectIdMessageRefReply,
	selectIdMessageToJump,
	selectMessageIdsByChannelId,
	selectOpenModalAttachment,
	selectTheme,
	useAppDispatch,
	useAppSelector,
} from '@mezon/store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChannelMessage, MemorizedChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
	userName?: string;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, userName, mode }: ChannelMessagesProps) {
	const messages = useAppSelector((state) => selectMessageIdsByChannelId(state, channelId));
	const chatRef = useRef<HTMLDivElement>(null);
	const hasMoreMessage = useSelector(selectHasMoreMessageByChannelId(channelId));
	const [messageid, setMessageIdToJump] = useState(getJumpToMessageId());
	const [timeToJump, setTimeToJump] = useState(1000);
	const [positionToJump, setPositionToJump] = useState<ScrollLogicalPosition>('center');
	const { jumpToMessage } = useJumpToMessage({ channelId: '', messageID: '', clanId: '' });
	const idMessageRefReply = useSelector(selectIdMessageRefReply);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const appearanceTheme = useSelector(selectTheme);
	const { idMessageNotifed } = useNotification();
	const firstMessageId = useAppSelector((state) => selectFirstMessageId(state, channelId));

	const { messageId } = useAppParams();

	useEffect(() => {
		if (messageId) setMessageIdToJump(messageId);
	}, [messageId]);

	const dispatch = useAppDispatch();
	const openModalAttachment = useSelector(selectOpenModalAttachment);

	useEffect(() => {
		return () => {
			dispatch(
				messagesActions.UpdateChannelLastMessage({
					channelId,
				}),
			);
		};
	}, [channelId]);

	const loadMoreMessage = useCallback(async () => {
		return await dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	const { isFetching } = useMessages({ chatRef, hasMoreMessage, loadMoreMessage, channelId, messages, firstMessageId });

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

	const messagesView = useMemo(() => {
		return messages.map((messageId) => {
			if (firstMessageId === messageId) return null;
			return (
				<MemorizedChannelMessage
					key={messageId}
					messageId={messageId}
					channelId={channelId}
					isHighlight={messageId === idMessageNotifed}
					mode={mode}
					channelLabel={channelLabel ?? ''}
				/>
			);
		});
	}, [messages, channelId, mode, channelLabel, idMessageNotifed]);

	return (
		<div
			className={`dark:bg-bgPrimary pb-5
			bg-bgLightPrimary
      overflow-y-scroll
			overflow-x-hidden h-full
			${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
			id="scrollLoading"
			ref={chatRef}
		>
			<div className="flex flex-col min-h-full justify-end">
				{firstMessageId && <ChatWelcome type={type} name={channelLabel} avatarDM={avatarDM} userName={userName} />}
				{isFetching && <p className="font-semibold text-center dark:text-textDarkTheme text-textLightTheme">Loading messages...</p>}
				<MessageContextMenuProvider>
					{messagesView}
					{openModalAttachment && <MessageModalImage />}
				</MessageContextMenuProvider>
			</div>
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
