import { ELoadMoreDirection, IBeforeRenderCb, useChatScroll } from '@mezon/chat-scroll';
import { MessageContextMenuProvider } from '@mezon/components';
import { useAuth } from '@mezon/core';
import {
	messagesActions,
	selectAllChannelMemberIds,
	selectAllRoleIds,
	selectHasMoreBottomByChannelId,
	selectHasMoreMessageByChannelId,
	selectIdMessageToJump,
	selectIsJumpingToPresent,
	selectIsMessageIdExist,
	selectIsViewingOlderMessagesByChannelId,
	selectLastMessageByChannelId,
	selectMessageIdsByChannelId,
	selectMessageIsLoading,
	selectMessageNotified,
	selectTheme,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Direction_Mode } from '@mezon/utils';
import classNames from 'classnames';
import { ChannelType } from 'mezon-js';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
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
	const appearanceTheme = useSelector(selectTheme);
	const idMessageNotified = useSelector(selectMessageNotified);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const isJumpingToPresent = useSelector(selectIsJumpingToPresent(channelId));
	const isMessageExist = useSelector(selectIsMessageIdExist(channelId, idMessageToJump));
	const isViewingOlderMessages = useSelector(selectIsViewingOlderMessagesByChannelId(channelId));
	const isFetching = useSelector(selectMessageIsLoading);
	const hasMoreTop = useSelector(selectHasMoreMessageByChannelId(channelId));
	const hasMoreBottom = useSelector(selectHasMoreBottomByChannelId(channelId));
	const lastMessage = useAppSelector((state) => selectLastMessageByChannelId(state, channelId));
	const { userId } = useAuth();
	const listMessageRef = useRef<HTMLDivElement | null>(null);
	const onChatRender = useCallback(
		(node: HTMLDivElement | null) => {
			chatRef.current = node;
			if (node) {
				node.scrollTo(0, Number.MAX_SAFE_INTEGER);
			}
		},
		// the function needs to be re-created when channelId changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[channelId]
	);

	const allUserIdsInChannel = useAppSelector((state) => selectAllChannelMemberIds(state, channelId as string));
	const allRolesInClan = useSelector(selectAllRoleIds);
	const dispatch = useAppDispatch();

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
	const chatScrollRef = useChatScroll(chatRef, listMessageRef, chatRefData, loadMoreMessage);

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
			chatScrollRef.scrollToBottom().then(() => {
				dispatch(messagesActions.setIsJumpingToPresent({ channelId, status: false }));
			});
		}
	}, [dispatch, isJumpingToPresent, chatScrollRef, channelId]);

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

	useEffect(() => {
		if (userId === lastMessage?.sender_id) {
			return;
		}
		const timeoutId = setTimeout(() => {
			const element = chatRef.current;
			if (!element) {
				return;
			}

			const bottomOffsetToScroll = 100;
			const isNearBottom = element?.scrollHeight - element?.scrollTop - element?.clientHeight < bottomOffsetToScroll;
			if (isNearBottom) {
				element?.scrollTo(0, Number.MAX_SAFE_INTEGER);
			}
		}, 100);
		return () => timeoutId && clearTimeout(timeoutId);
	}, [lastMessage, userId]);

	return (
		<MessageContextMenuProvider allUserIdsInChannel={allUserIdsInChannel} allRolesInClan={allRolesInClan}>
			<div className="w-full h-full relative">
				<div
					id="scrollLoading"
					className={classNames(
						'absolute top-0 left-0 bottom-0 right-0 overflow-y-visible overflow-x-hidden overflow-anchor-none dark:bg-bgPrimary bg-bgLightPrimary',
						{
							customScrollLightMode: appearanceTheme === 'light'
						}
					)}
					ref={onChatRender}
				>
					<div ref={listMessageRef} className="min-h-[100%] overflow-anchor-none flex flex-col justify-end">
						{isFetching && <p className="font-semibold text-center dark:text-textDarkTheme text-textLightTheme">Loading messages...</p>}
						<div className="min-h-0 overflow-hidden">
							{messages.map((messageId) => {
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
							})}
						</div>
						<div className="h-[20px] w-[1px] pointer-events-none"></div>
					</div>
				</div>
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
