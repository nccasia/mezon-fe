import { useAuth, useChatMessages } from '@mezon/core';
import { MessagesEntity, selectCurrentChannelId, selectIdMessageRefReply, selectIdMessageToJump, selectOpenReplyMessageState } from '@mezon/store';
import classNames from 'classnames';
import React, { useMemo, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { useHover } from 'usehooks-ts';
import * as Icons from '../../../../../ui/src/lib/Icons/index';
import MessageAttachment from './MessageAttachment';
import MessageAvatar from './MessageAvatar';
import MessageContent from './MessageContent';
import MessageHead from './MessageHead';
import MessageReaction from './MessageReaction/MessageReaction';
import MessageReply from './MessageReply/MessageReply';
import { useMessageParser } from './useMessageParser';

export type ReactedOutsideOptional = {
	id: string;
	emoji?: string;
	messageId: string;
};

export type MessageWithUserProps = {
	message: MessagesEntity;
	isMessNotifyMention?: boolean;
	mode: number;
	isMention?: boolean;
	isEditing?: boolean;
	isShowFull?: boolean;
	isHighlight?: boolean;
	editor?: JSX.Element;
	onContextMenu?: (event: React.MouseEvent<HTMLParagraphElement>) => void;
	popup?: JSX.Element;
	isSearchMessage?: boolean
};

function MessageWithUser({
	message,
	isMessNotifyMention,
	mode,
	editor,
	isMention,
	onContextMenu,
	isEditing,
	isHighlight,
	popup,
	isShowFull,
	isSearchMessage
}: Readonly<MessageWithUserProps>) {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const openReplyMessageState = useSelector(selectOpenReplyMessageState);
	const idMessageRefReply = useSelector(selectIdMessageRefReply);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const { lastMessageId } = useChatMessages({ channelId: currentChannelId ?? '' });
	const containerRef = useRef<HTMLDivElement>(null);
	const isHover = useHover(containerRef);
	const userLogin = useAuth();
	const isCombine = !message.isStartedMessageGroup;
	const checkReplied = idMessageRefReply === message.id && openReplyMessageState && message.id !== lastMessageId;
	const checkMessageTargetToMoved = idMessageToJump === message.id && message.id !== lastMessageId;
	const hasIncludeMention = message.content.t?.includes('@here') || message.content.t?.includes(`@${userLogin.userProfile?.user?.username}`);
	const checkReferences = message.references?.length !== 0;

	const shouldShowDateDivider = useMemo(() => {
		return message.isStartedMessageOfTheDay;
	}, [message]);

	const checkMessageHasReply = useMemo(() => {
		return message.references && message.references?.length > 0;
	}, [message.references]);

	const checkMessageIncludeMention = useMemo(() => {
		return hasIncludeMention;
	}, [hasIncludeMention]);

	const containerClass = classNames('relative', 'message-container', {
		'mt-3': !isCombine || checkReferences,
		'is-sending': message.isSending,
		'is-error': message.isError,
		'bg-[#383B47]': isHighlight,
	});

	const parentDivClass = classNames(
		'flex h-15 flex-col w-auto px-3',
		{ 'mt-0': isMention },
		{ 'pt-[2px]': !isCombine },
		{ 'dark:bg-[#383B47]': hasIncludeMention || checkReplied || checkMessageTargetToMoved },
		{ 'dark:bg-[#403D38]': checkMessageIncludeMention },
		{ 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]': !hasIncludeMention && !checkReplied && !checkMessageTargetToMoved },
	);

	const childDivClass = classNames(
		'absolute w-0.5 h-full left-0',
		{ 'dark:bg-blue-500': hasIncludeMention || checkReplied || checkMessageTargetToMoved },
		{ 'dark:bg-[#403D38]': hasIncludeMention },
		{ 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]': !hasIncludeMention && !checkReplied && !checkMessageTargetToMoved },
	);

	const messageContentClass = classNames('flex flex-col whitespace-pre-wrap text-base w-full cursor-text');

	return (
		<>
			{shouldShowDateDivider && <MessageDateDivider message={message} />}
			<div className={containerClass} ref={containerRef} onContextMenu={onContextMenu}>
				<div className="relative rounded-sm overflow-visible">
					<div className={childDivClass}></div>
					<div className={parentDivClass}>
						{checkMessageHasReply && <MessageReply message={message} />}
						<div className={`justify-start gap-4 inline-flex w-full relative h-fit overflow-visible ${isSearchMessage ? '' : 'pr-12'}`}>
							<MessageAvatar message={message} isCombine={isCombine} isEditing={isEditing} isShowFull={isShowFull} mode={mode} />
							<div className="w-full relative h-full">
								<MessageHead message={message} isCombine={isCombine} isShowFull={isShowFull} mode={mode} />
								<div id={message.id} className="justify-start items-center  inline-flex w-full h-full pt-[2px] textChat">
									<div className={messageContentClass} style={{ wordBreak: 'break-word' }}>
										{isEditing && editor}
										{!isEditing && (
											<MessageContent
												message={message}
												isCombine={isCombine}
												isSending={message.isSending}
												isError={message.isError}
												mode={mode}
											/>
										)}
										<MessageAttachment mode={mode} message={message} onContextMenu={onContextMenu} />
									</div>
								</div>
							</div>
						</div>
						<MessageStatus message={message} isMessNotifyMention={isMessNotifyMention} />
					</div>
				</div>
				<MessageReaction message={message} mode={mode} />
				{isHover && popup}
			</div>
		</>
	);
}

function MessageDateDivider({ message }: { message: MessagesEntity }) {
	const { messageDate } = useMessageParser(message);

	return (
		<div className="flex flex-row w-full px-4 items-center pt-3 text-zinc-400 text-[12px] font-[600] dark:bg-transparent bg-transparent">
			<div className="w-full border-b-[1px] dark:border-borderDivider border-borderDividerLight opacity-50 text-center"></div>
			<span className="text-center px-3 whitespace-nowrap">{messageDate}</span>
			<div className="w-full border-b-[1px] dark:border-borderDivider border-borderDividerLight opacity-50 text-center"></div>
		</div>
	);
}

function MessageStatus({ message, isMessNotifyMention }: Partial<MessageWithUserProps>) {
	const isCombine = !message?.isStartedMessageGroup;

	const shouldShowSentIcon = useMemo(() => {
		return message && !isMessNotifyMention && !isCombine;
	}, [message, isMessNotifyMention, isCombine]);

	return (
		<div className="absolute top-[100] right-2 flex-row items-center gap-x-1 text-xs text-gray-600">{shouldShowSentIcon && <Icons.Sent />}</div>
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
