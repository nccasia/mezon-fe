import { MessagesEntity, selectCurrentChannelId, selectIdMessageRefReply, selectIdMessageToJump, selectOpenReplyMessageState } from '@mezon/store';
import { IChannelMember, RightClickPost } from '@mezon/utils';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import * as Icons from '../Icons/index';
import MessageAttachment from './MessageAttachment';
import MessageAvatar from './MessageAvatar';
import MessageHead from './MessageHead';
import MessageReply from './MessageReply';
import { useMessageParser } from './useMessageParser';

import { useAuth, useChatMessages, useNotification, useOnClickOutside, useRightClick } from '@mezon/core';
import { useSelector } from 'react-redux';
import ContextMenu from '../RightClick/ContextMenu';
import MessageContent from './MessageContent';

export type ReactedOutsideOptional = {
	id: string;
	emoji?: string;
	messageId: string;
};

export type MessageWithUserProps = {
	message: MessagesEntity;
	user?: IChannelMember | null;
	isMessNotifyMention?: boolean;
	mode: number;
	newMessage?: string;
	child?: JSX.Element;
	isMention?: boolean;
};

function MessageWithUser({ message, user, isMessNotifyMention, mode, newMessage, child, isMention }: Readonly<MessageWithUserProps>) {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { messageDate } = useMessageParser(message);
	const divMessageWithUser = useRef<HTMLDivElement>(null);
	const openReplyMessageState = useSelector(selectOpenReplyMessageState);
	const idMessageRefReply = useSelector(selectIdMessageRefReply);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const { lastMessageId } = useChatMessages({ channelId: currentChannelId ?? '' });
	const { idMessageNotifed, setMessageNotifedId } = useNotification();
	const userLogin = useAuth();

	const isCombine = !message.isStartedMessageGroup;

	const attachments = useMemo(() => message.attachments, [message.attachments]);

	const propsChild = { isCombine };
	const checkReplied = idMessageRefReply === message.id && openReplyMessageState && message.id !== lastMessageId;
	const checkMessageTargetToMoved = idMessageToJump === message.id && message.id !== lastMessageId;
	const hasIncludeMention = message.content.t?.includes('@here') || message.content.t?.includes(`@${userLogin.userProfile?.user?.username}`);
	const checkReferences = message.references?.length !== 0;

	const [checkMessageReply, setCheckMessageReply] = useState(false);
	const [checkMessageToMove, setCheckMessageToMove] = useState(false);
	const [checkMessageIncludeMention, setCheckMessageIncludeMention] = useState<boolean | undefined>(false);
	const messageWithUserRef = useRef<HTMLDivElement | null>(null);
	const { setRightClickXy } = useRightClick();
	const { setMessageRightClick } = useRightClick();

	useEffect(() => {
		setCheckMessageReply(checkReplied);
		setCheckMessageToMove(checkMessageTargetToMoved);
		setCheckMessageIncludeMention(hasIncludeMention ?? undefined);
	}, [checkReplied, checkMessageTargetToMoved, hasIncludeMention, idMessageToJump]);

	const [classNameHighlightParentDiv, setClassNameHighlightParentDiv] = useState<string>('');
	const [classNameHighlightChildDiv, setClassNameHighlightChildDiv] = useState<string>('');
	const [classNameNotification, setClassNameNotification] = useState<string>('');

	useEffect(() => {
		let resetTimeoutId: NodeJS.Timeout | null = null;

		if (idMessageNotifed === message.id) {
			setClassNameNotification('bg-[#383B47]');
			resetTimeoutId = setTimeout(() => {
				setClassNameNotification('');
				setMessageNotifedId('');
			}, 2000);
		}
		return () => {
			if (resetTimeoutId) {
				clearTimeout(resetTimeoutId);
			}
		};
	}, [idMessageNotifed, message.id]);

	useEffect(() => {
		if (checkMessageReply || checkMessageToMove) {
			setClassNameHighlightParentDiv('dark:bg-[#383B47]');
			setClassNameHighlightChildDiv('dark:bg-blue-500');
		} else if (checkMessageIncludeMention) {
			setClassNameHighlightParentDiv('dark:bg-[#403D38]');
			setClassNameHighlightChildDiv('dark:bg-[#F0B132]');
		}
	}, [checkMessageReply, checkMessageToMove, checkMessageIncludeMention]);

	const messageDividerClass = classNames(
		'flex flex-row w-full px-4 items-center pt-3 text-zinc-400 text-[12px] font-[600] dark:bg-transparent bg-transparent',
		{ hidden: !message.isStartedMessageOfTheDay || isMessNotifyMention },
	);

	const containerClass = classNames('relative', 'message-container', {
		'mt-3': !isCombine || checkReferences,
		'is-sending': message.isSending,
		'is-error': message.isError,
		[classNameNotification]: classNameNotification,
	});

	const parentDivClass = classNames(
		'flex h-15 flex-col w-auto px-3',
		{ 'mt-0': isMention },
		{ 'pt-[2px]': !isCombine },
		{ [classNameHighlightParentDiv]: hasIncludeMention || checkReplied || checkMessageTargetToMoved },
		{ 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]': !hasIncludeMention && !checkReplied && !checkMessageTargetToMoved },
	);

	const childDivClass = classNames(
		'absolute w-0.5 h-full left-0',
		{ [classNameHighlightChildDiv]: hasIncludeMention || checkReplied || checkMessageTargetToMoved },
		{ 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]': !hasIncludeMention && !checkReplied && !checkMessageTargetToMoved },
	);

	const messageContentClass = classNames('flex flex-col whitespace-pre-wrap text-base w-full cursor-text');

	const [isMenuVisible, setMenuVisible] = useState(false);
	const handleContextMenu = (event: React.MouseEvent<HTMLImageElement>) => {
		event.preventDefault();
		setRightClickXy({ x: event.pageX, y: event.pageY });
		setMenuVisible(true);
		setMessageRightClick(message.id);
	};

	const handleCloseMenu = () => {
		setMenuVisible(false);
	};

	useOnClickOutside(messageWithUserRef, handleCloseMenu);

	return (
		<>
			<div className={messageDividerClass}>
				<div className="w-full border-b-[1px] dark:border-borderDivider border-borderDividerLight opacity-50 text-center"></div>
				<span className="text-center px-3 whitespace-nowrap">{messageDate}</span>
				<div className="w-full border-b-[1px] dark:border-borderDivider border-borderDividerLight opacity-50 text-center"></div>
			</div>
			<div className={containerClass}>
				<div className="relative rounded-sm overflow-visible">
					<div className={childDivClass}></div>
					<div className={parentDivClass}>
						<MessageReply message={message} />
						<div
							className="justify-start gap-4 inline-flex w-full relative h-fit overflow-visible pr-12"
							ref={divMessageWithUser}
							onContextMenu={handleContextMenu}
							onClick={handleCloseMenu}
						>
							<MessageAvatar user={user} message={message} isCombine={isCombine} />
							<div className="w-full relative h-full">
								<MessageHead message={message} user={user} isCombine={isCombine} />
								<div className="justify-start items-center inline-flex w-full h-full pt-[2px] textChat">
									<div className={messageContentClass} style={{ wordBreak: 'break-word' }}>
										<MessageContent
											message={message}
											user={user}
											isCombine={isCombine}
											newMessage={newMessage}
											isSending={message.isSending}
											isError={message.isError}
										/>
										{child?.props.children[1] &&
											React.isValidElement(child?.props.children[1]) &&
											React.cloneElement(child?.props.children[1])}
									</div>
								</div>
								<MessageAttachment attachments={attachments} />
							</div>
						</div>
						{message && !isMessNotifyMention && (
							<div
								className={classNames('absolute top-[100] right-2 flex-row items-center gap-x-1 text-xs text-gray-600', {
									hidden: isCombine,
								})}
							>
								<Icons.Sent />
							</div>
						)}
					</div>
				</div>
				{child?.props.children[0] &&
					React.isValidElement(child?.props.children[0]) &&
					React.cloneElement(child?.props.children[0], propsChild)}
				{isMenuVisible && <ContextMenu urlData={''} posClick={RightClickPost.MESSAGE_ON_CHANNEL} onClose={handleCloseMenu} />}
			</div>
		</>
	);
}

MessageWithUser.Skeleton = () => {
	return (
		<div className="flex py-0.5 min-w-min mx-3 h-15 mt-3 hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer flex-shrink-1">
			<Skeleton circle={true} width={38} height={38} />
		</div>
	);
};

export default MessageWithUser;
