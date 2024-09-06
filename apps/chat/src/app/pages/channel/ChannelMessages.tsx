import { ELoadMoreDirection, IBeforeRenderCb, useChatScroll } from '@mezon/chat-scroll';
import { MessageContextMenuProvider, MessageModalImage } from '@mezon/components';
import {
	messagesActions,
	selectFirstMessageId,
	selectHasMoreBottomByChannelId,
	selectHasMoreMessageByChannelId,
	selectIdMessageToJump,
	selectIsJumpingToPresent,
	selectIsMessageIdExist,
	selectIsViewingOlderMessagesByChannelId,
	selectMessageIdsByChannelId,
	selectMessageIsLoading,
	selectMessageNotified,
	selectOpenModalAttachment,
	selectTheme,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Direction_Mode } from '@mezon/utils';
import classNames from 'classnames';
import { ChannelType } from 'mezon-js';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChannelMessage, MemorizedChannelMessage } from './ChannelMessage';

type ChannelMessagesProps = {
	channelId: string;
	type: ChannelType;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
	userName?: string;
};

function ChannelMessages({ channelId, channelLabel, type, avatarDM, userName, mode }: ChannelMessagesProps) {
	const messages = useAppSelector((state) => selectMessageIdsByChannelId(state, channelId));
	const chatRef = useRef<HTMLDivElement | null>(null);
	const anchorRef = useRef<HTMLDivElement | null>(null);
	const appearanceTheme = useSelector(selectTheme);
	const idMessageNotified = useSelector(selectMessageNotified);
	const firstMessageId = useAppSelector((state) => selectFirstMessageId(state, channelId));
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const isJumpingToPresent = useSelector(selectIsJumpingToPresent(channelId));
	const isMessageExist = useSelector(selectIsMessageIdExist(channelId, idMessageToJump));
	const isViewingOlderMessages = useSelector(selectIsViewingOlderMessagesByChannelId(channelId));
	const isFetching = useSelector(selectMessageIsLoading);
	const hasMoreTop = useSelector(selectHasMoreMessageByChannelId(channelId));
	const hasMoreBottom = useSelector(selectHasMoreBottomByChannelId(channelId));
	const [shouldRenderLoadingBlock, setShouldRenderLoadingBlock] = useState<boolean>(false);

	const onChatRender = useCallback((node: HTMLDivElement | null) => {
		chatRef.current = node;
		if (node) {
			node.scrollTop = node.scrollHeight;
		}
	}, []);

	const dispatch = useAppDispatch();
	const openModalAttachment = useSelector(selectOpenModalAttachment);

	const loadMoreMessage = useCallback(
		async (direction: ELoadMoreDirection, cb: IBeforeRenderCb) => {
			if (isFetching) {
				return;
			}

			if (direction === ELoadMoreDirection.bottom && !hasMoreBottom) {
				return;
			}

			if (direction === ELoadMoreDirection.top && !hasMoreTop) {
				return;
			}

			if (typeof cb === 'function') {
				cb();
			}

			if (direction === ELoadMoreDirection.bottom) {
				await dispatch(messagesActions.loadMoreMessage({ channelId, direction: Direction_Mode.AFTER_TIMESTAMP }));
				return true;
			}

			await dispatch(messagesActions.loadMoreMessage({ channelId, direction: Direction_Mode.BEFORE_TIMESTAMP }));

			return true;
		},
		[dispatch, channelId, hasMoreTop, hasMoreBottom, isFetching]
	);

	const chatRefData = useMemo(() => {
		return {
			data: messages,
			hasNextPage: hasMoreBottom,
			hasPreviousPage: hasMoreTop
		};
	}, [messages, hasMoreBottom, hasMoreTop]);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	const chatScrollRef = useChatScroll(chatRef, anchorRef, chatRefData, loadMoreMessage);

	const messagesView = useMemo(() => {
		return messages.map((messageId) => {
			return (
				<MemorizedChannelMessage
					avatarDM={avatarDM}
					userName={userName}
					key={messageId}
					messageId={messageId}
					channelId={channelId}
					isHighlight={messageId === idMessageNotified}
					mode={mode}
					channelLabel={channelLabel ?? ''}
				/>
			);
		});
	}, [messages, firstMessageId, channelId, idMessageNotified, mode, channelLabel, avatarDM, userName]);

	// Jump to message when user is jumping to message
	useEffect(() => {
		if (idMessageToJump && isMessageExist) {
			chatScrollRef.scrollToMessage(idMessageToJump).then((res) => {
				if (res) {
					dispatch(messagesActions.setIdMessageToJump(null));
				}
			});
		}
	}, [dispatch, idMessageToJump, isMessageExist, chatScrollRef]);

	// Jump to present when user is jumping to present
	useEffect(() => {
		if (isJumpingToPresent) {
			chatScrollRef.scrollToAnchor().then(() => {
				dispatch(messagesActions.setIsJumpingToPresent({ channelId, status: true }));
			});
		}
	}, [dispatch, isJumpingToPresent, chatScrollRef]);

	// Update last message of channel when component unmount
	useEffect(() => {
		chatScrollRef.updateLoadMoreCb(loadMoreMessage);
	}, [loadMoreMessage, chatScrollRef]);

	// Disable sticky scroll when viewing older messages
	useEffect(() => {
		if (isViewingOlderMessages) {
			chatScrollRef.disableStickyScroll();
		} else {
			chatScrollRef.enableStickyScroll();
		}
	}, [chatScrollRef, isViewingOlderMessages]);

	// TODO: move this to another place
	useEffect(() => {
		// Update last message of channel when component unmount
		return () => {
			dispatch(
				messagesActions.UpdateChannelLastMessage({
					channelId
				})
			);
		};
	}, [channelId, dispatch]);

	// render show loading when user can see it
	useEffect(() => {
		if (!chatRef.current) {
			return;
		}
		requestAnimationFrame(() => {
			const scrollTop = chatRef.current?.scrollTop ?? 0;
			const clientHeight = chatRef.current?.clientHeight ?? 0;
			if (clientHeight > 0 && scrollTop > clientHeight) {
				setShouldRenderLoadingBlock(false);
				return;
			}
			setShouldRenderLoadingBlock(true);
		});
	}, [isFetching]);

	return (
		<MessageContextMenuProvider>
			<div
				className={classNames('dark:bg-bgPrimary pb-5 bg-bgLightPrimary overflow-y-scroll overflow-x-hidden h-full', {
					customScrollLightMode: appearanceTheme === 'light'
				})}
				id="scrollLoading"
				ref={onChatRender}
			>
				<div className="flex flex-col min-h-full justify-end">
					{shouldRenderLoadingBlock && isFetching && (
						<p className="font-semibold text-center dark:text-textDarkTheme text-textLightTheme">Loading messages...</p>
					)}
					{messagesView}
					{openModalAttachment && <MessageModalImage />}
				</div>
				<div ref={anchorRef} className="anchor"></div>
			</div>
		</MessageContextMenuProvider>
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

const MemoizedChannelMessages = memo(ChannelMessages) as unknown as typeof ChannelMessages & { Skeleton: typeof ChannelMessages.Skeleton };

export default MemoizedChannelMessages;
