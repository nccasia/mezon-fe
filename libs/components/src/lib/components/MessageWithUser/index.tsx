import { ContextMenu, MessageReaction } from '@mezon/components';
import { selectCurrentChannelId } from '@mezon/store';
import {
	EmojiDataOptionals,
	IChannelMember,
	IMessageWithUser,
	RightClickPost,
	TIME_COMBINE,
	checkSameDay,
	getTimeDifferenceInSeconds,
} from '@mezon/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import * as Icons from '../Icons/index';
import MessageAttachment from './MessageAttachment';
import MessageAvatar from './MessageAvatar';
import MessageHead from './MessageHead';
import MessageReply from './MessageReply';
import { useMessageParser } from './useMessageParser';

import { useAuth, useChatMessages, useNotification, useOnClickOutside, useReference, useRightClick } from '@mezon/core';
import { useSelector } from 'react-redux';
import MessageContent from './MessageContent';

export type ReactedOutsideOptional = {
	id: string;
	emoji?: string;
	messageId: string;
};

export type MessageWithUserProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	user?: IChannelMember | null;
	isMessNotifyMention?: boolean;
	mode: number;
	newMessage?: string;
	child?: JSX.Element;
	isMention?: boolean;
	dataReaction: EmojiDataOptionals[];
};

function MessageWithUser({
	message,
	preMessage,
	user,
	isMessNotifyMention,
	mode,
	newMessage,
	child,
	isMention,
	dataReaction,
}: Readonly<MessageWithUserProps>) {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { messageDate } = useMessageParser(message);
	const divMessageWithUser = useRef<HTMLDivElement>(null);
	const { openReplyMessageState, idMessageRefReply, idMessageToJump, idMessageRefEdit } = useReference();
	const { lastMessageId } = useChatMessages({ channelId: currentChannelId ?? '' });
	const { idMessageNotifed, setMessageNotifedId } = useNotification();
	const userLogin = useAuth();

	const isCombine = useMemo(() => {
		const timeDiff = getTimeDifferenceInSeconds(preMessage?.create_time as string, message?.create_time as string);
		return (
			timeDiff < TIME_COMBINE &&
			preMessage?.user?.id === message?.user?.id &&
			checkSameDay(preMessage?.create_time as string, message?.create_time as string)
		);
	}, [message, preMessage]);

	const attachments = useMemo(() => {
		return message.attachments;
	}, [message.attachments]);

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

	const [classNameHighligntParentDiv, setClassNameHightlightParentDiv] = useState<string>('');
	const [classNameHighligntChildDiv, setClassNameHightlightChildDiv] = useState<string>('');
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
			setClassNameHightlightParentDiv('dark:bg-[#383B47]');
			setClassNameHightlightChildDiv(' dark:bg-blue-500');
		} else if (checkMessageIncludeMention) {
			setClassNameHightlightParentDiv('dark:bg-[#403D38]');
			setClassNameHightlightChildDiv(' dark:bg-[#F0B132]');
		}
	}, [checkMessageReply, checkMessageToMove, checkMessageIncludeMention]);

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
			{!checkSameDay(preMessage?.create_time as string, message?.create_time as string) && !isMessNotifyMention && (
				<div className="flex flex-row w-full px-4 items-center pt-3 text-zinc-400 text-[12px] font-[600] dark:bg-transparent bg-transparent">
					<div className="w-full border-b-[1px] dark:border-borderDivider border-borderDividerLight opacity-50 text-center"></div>
					<span className="text-center px-3 whitespace-nowrap">{messageDate}</span>
					<div className="w-full border-b-[1px] dark:border-borderDivider border-borderDividerLight opacity-50 text-center"></div>
				</div>
			)}
			<div
				className={`relative ${isCombine ? '' : 'mt-3'} ${checkReferences && 'mt-3'} ${classNameNotification}`}
				ref={messageWithUserRef}
				onContextMenu={handleContextMenu}
				onClick={handleCloseMenu}
			>
				<div className={` relative rounded-sm  overflow-visible `}>
					<div
						className={` absolute w-0.5 h-full left-0
						${hasIncludeMention || checkReplied || checkMessageTargetToMoved ? `${classNameHighligntChildDiv}` : 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]'}`}
					></div>
					<div
						className={`flex h-15 flex-col w-auto px-3
						${isMention ? 'mt-0' : isCombine ? '' : 'pt-[2px]'}
						${hasIncludeMention || checkReplied || checkMessageTargetToMoved ? `${classNameHighligntParentDiv}` : 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]'}`}
					>
						{' '}
						<MessageReply message={message} />
						<div className="justify-start gap-4 inline-flex w-full relative h-fit overflow-visible pr-12" ref={divMessageWithUser}>
							<MessageAvatar user={user} message={message} isCombine={isCombine} />
							<div className="w-full relative h-full">
								<MessageHead message={message} user={user} isCombine={isCombine} />
								<div className={`justify-start items-center inline-flex w-full h-full ${isCombine ? '' : 'pt-[2px]'} textChat`}>
									<div
										className="flex flex-col text-[#CCCCCC] whitespace-pre-wrap text-base w-full cursor-text"
										style={{ wordBreak: 'break-word' }}
									>
										<MessageContent message={message} user={user} isCombine={isCombine} newMessage={newMessage} />
										{child?.props.children[1] &&
											React.isValidElement(child?.props.children[1]) &&
											React.cloneElement(child?.props.children[1], propsChild)}
									</div>
								</div>
								<MessageAttachment attachments={attachments} />
							</div>
						</div>
						<MessageReaction dataReaction={dataReaction} currentChannelId={currentChannelId || ''} message={message} mode={mode} />
						{message && !isMessNotifyMention && (
							<div
								className={`absolute top-[100] right-2 flex-row items-center gap-x-1 text-xs text-gray-600 ${isCombine ? 'hidden' : 'flex'}`}
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
		<div className="flex py-0.5 min-w-min mx-3 h-15 mt-3 hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer  flex-shrink-1">
			<Skeleton circle={true} width={38} height={38} />
		</div>
	);
};

export default MessageWithUser;
