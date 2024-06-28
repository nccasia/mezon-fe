import { useAuth, useChatMessages } from '@mezon/core';
import { MessagesEntity, selectCurrentChannelId, selectIdMessageRefReply, selectIdMessageToJump, selectOpenReplyMessageState } from '@mezon/store';
import { IChannelMember } from '@mezon/utils';
import classNames from 'classnames';
import React, { useMemo, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { useHover } from 'usehooks-ts';
import * as Icons from '../Icons/index';
import MessageAttachment from './MessageAttachment';
import MessageAvatar from './MessageAvatar';
import MessageContent from './MessageContent';
import MessageHead from './MessageHead';
import MessageReaction from './MessageReaction/MessageReaction';
import MessageReply from './MessageReply/MessageReply';
import { useMessageParser } from './useMessageParser';

export type MessageWithUserProps = {
	message: MessagesEntity;
	user?: IChannelMember | null;
	isMessNotifyMention?: boolean;
	mode: number;
	isMention?: boolean;
	isEditing?: boolean;
	popup?: JSX.Element;
	editor?: JSX.Element;
	onContextMenu?: (event: React.MouseEvent<HTMLParagraphElement>) => void;
};

const MessageWithUser = ({ message, user, isMessNotifyMention, mode, editor, isMention, onContextMenu, isEditing, popup }: MessageWithUserProps) => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const openReplyMessageState = useSelector(selectOpenReplyMessageState);
	const idMessageRefReply = useSelector(selectIdMessageRefReply);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const { lastMessageId } = useChatMessages({ channelId: currentChannelId ?? '' });
	// const { idMessageNotifed, setMessageNotifedId } = useNotification();
	const containerRef = useRef<HTMLDivElement>(null);
	const isHover = useHover(containerRef);
	const userLogin = useAuth();

	const isCombine = !message.isStartedMessageGroup;
	const checkReplied = useMemo(
		() => idMessageRefReply === message.id && openReplyMessageState && message.id !== lastMessageId,
		[idMessageRefReply, openReplyMessageState, message.id, lastMessageId],
	);
	const checkMessageTargetToMoved = useMemo(
		() => idMessageToJump === message.id && message.id !== lastMessageId,
		[idMessageToJump, message.id, lastMessageId],
	);
	const hasIncludeMention = useMemo(
		() => message.content.t?.includes('@here') || message.content.t?.includes(`@${userLogin.userProfile?.user?.username}`),
		[message.content.t, userLogin.userProfile?.user?.username],
	);
	const checkReferences = useMemo(() => message.references?.length !== 0, [message.references]);

	const classNameHighlightParentDiv = useMemo(() => {
		if (checkReplied || checkMessageTargetToMoved) return 'dark:bg-[#383B47]';
		if (hasIncludeMention) return 'dark:bg-[#403D38]';
		return '';
	}, [checkReplied, checkMessageTargetToMoved, hasIncludeMention]);

	const classNameHighlightChildDiv = useMemo(() => {
		if (checkReplied || checkMessageTargetToMoved) return 'dark:bg-blue-500';
		if (hasIncludeMention) return 'dark:bg-[#F0B132]';
		return '';
	}, [checkReplied, checkMessageTargetToMoved, hasIncludeMention]);

	const isHeadFull = useMemo(() => {
		return isCombine && !checkReferences;
	}, [isCombine, checkReferences]);

	const containerClass = classNames('relative', 'message-container', {
		'mt-3': !isCombine || checkReferences,
		'is-sending': message.isSending,
		'is-error': message.isError,
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

	const messageContentClass = 'flex flex-col whitespace-pre-wrap text-base w-full cursor-text';

	const shouldShowDateDivider = useMemo(() => {
		return message.isStartedMessageOfTheDay;
	}, [message]);

	const checkMessageHasReply = useMemo(() => {
		return message.references && message.references?.length > 0;
	}, [message.references]);

	return (
		<>
			{shouldShowDateDivider && <MessageDateDivider message={message} />}
			<div className={containerClass} ref={containerRef} onContextMenu={onContextMenu}>
				<div className="relative rounded-sm overflow-visible">
					<div className={childDivClass}></div>
					<div className={parentDivClass}>
						{checkMessageHasReply && <MessageReply message={message} />}
						<div className="justify-start gap-4 inline-flex w-full relative h-fit overflow-visible pr-12">
							<MessageAvatar user={user} message={message} isCombine={isCombine} />
							<div className="w-full relative h-full">
								{isHeadFull && <MessageHead message={message} user={user} isCombine={isCombine} />}
								<div className="justify-start items-center inline-flex w-full h-full pt-[2px] textChat">
									<div className={messageContentClass} style={{ wordBreak: 'break-word' }}>
										<MessageAttachment message={message} onContextMenu={onContextMenu} />
										{!isEditing && (
											<MessageContent
												message={message}
												user={user}
												isCombine={isCombine}
												isSending={message.isSending}
												isError={message.isError}
											/>
										)}
										{isEditing && editor}
									</div>
								</div>
							</div>
						</div>
						<MessageStatus message={message} isMessNotifyMention={isMessNotifyMention} />
						<MessageReaction message={message} mode={mode} />
					</div>
				</div>
				{isHover && popup}
			</div>
		</>
	);
};

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

MessageWithUser.Skeleton = () => (
	<div className="flex py-0.5 min-w-min mx-3 h-15 mt-3 hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer flex-shrink-1">
		<Skeleton circle={true} width={38} height={38} />
	</div>
);

export default MessageWithUser;
