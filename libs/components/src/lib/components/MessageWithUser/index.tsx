import { useAuth, useOnClickOutside } from '@mezon/core';
import {
	MessagesEntity,
	selectCurrentChannel,
	selectDataReferences,
	selectIdMessageToJump,
	selectJumpPinMessageId,
	selectLastMessageIdByChannelId,
	selectMemberClanByUserId,
	useAppSelector
} from '@mezon/store';
import { HEIGHT_PANEL_PROFILE, HEIGHT_PANEL_PROFILE_DM, WIDTH_CHANNEL_LIST_BOX, WIDTH_CLAN_SIDE_BAR } from '@mezon/utils';
import classNames from 'classnames';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ModalUserProfile from '../ModalUserProfile';
import MessageAttachment from './MessageAttachment';
import MessageAvatar from './MessageAvatar';
import MessageContent from './MessageContent';
import MessageHead from './MessageHead';
import MessageReaction from './MessageReaction/MessageReaction';
import MessageReply from './MessageReply/MessageReply';
import { useMessageParser } from './useMessageParser';

const NX_CHAT_APP_ANNONYMOUS_USER_ID = process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID || 'anonymous';

export type ReactedOutsideOptional = {
	id: string;
	emoji?: string;
	messageId: string;
};

export type MessageWithUserProps = {
	message: MessagesEntity;
	mode: number;
	isMention?: boolean;
	isEditing?: boolean;
	isShowFull?: boolean;
	isHighlight?: boolean;
	editor?: JSX.Element;
	onContextMenu?: (event: React.MouseEvent<HTMLParagraphElement>) => void;
	popup?: JSX.Element;
	isSearchMessage?: boolean;
	allowDisplayShortProfile: boolean;
};

function MessageWithUser({
	message,
	mode,
	editor,
	isMention,
	onContextMenu,
	isEditing,
	isHighlight,
	popup,
	isShowFull,
	isSearchMessage,
	allowDisplayShortProfile
}: Readonly<MessageWithUserProps>) {
	const userLogin = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const user = useAppSelector(selectMemberClanByUserId(userLogin.userProfile?.user?.id || ''));
	const { senderId, username, userClanAvatar, userClanNickname, userDisplayName, senderIdMessageRef, avatarSender, messageAvatarSenderRef } =
		useMessageParser(message);
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const [positionShortUser, setPositionShortUser] = useState<{ top: number; left: number } | null>(null);
	const [shortUserId, setShortUserId] = useState('');
	const positionStyle = currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING ? { right: `120px` } : { left: `${positionShortUser?.left}px` };
	const checkAnonymous = useMemo(() => message?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);
	const dataReferences = useSelector(selectDataReferences(message?.channel_id ?? ''));

	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));

	// Computed values
	const isCombine = !message.isStartedMessageGroup;

	const { userId } = useAuth();
	const checkReplied = message?.references && message?.references[0]?.message_sender_id === userId;
	const messageReplyHighlight = (dataReferences?.message_ref_id && dataReferences?.message_ref_id === message?.id) || false;
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const lastMessageId = useAppSelector((state) => selectLastMessageIdByChannelId(state, message?.channel_id ?? ''));

	const checkMessageTargetToMoved = idMessageToJump === message.id && message.id !== lastMessageId;
	const attachments = message.attachments ?? [];
	const hasFailedAttachment = attachments.length === 1 && attachments[0].filename === 'failAttachment' && attachments[0].filetype === 'unknown';
	const isMeMessage = message.isMe;

	const shouldNotRender = useMemo(() => {
		const mentions = message?.mentions ?? [];
		return hasFailedAttachment && !isMeMessage && Object.keys(message.content).length === 0 && mentions.length === 0;
	}, [hasFailedAttachment, isMeMessage, message?.content, message?.mentions]);

	const hasIncludeMention = useMemo(() => {
		const userIdMention = userLogin.userProfile?.user?.id;
		const mentionOnMessage = message.mentions;
		let includesHere = false;
		if (typeof message.content?.t == 'string') {
			includesHere = message.content.t?.includes('@here');
		}
		const includesUser = mentionOnMessage?.some((mention) => mention.user_id === userIdMention);
		const includesRole = mentionOnMessage?.some((item) => user?.role_id?.includes(item?.role_id as string));
		return includesHere || includesUser || includesRole;
	}, [message.content?.t, userLogin.userProfile?.user?.id, message.mentions, user]);

	const checkReferences = message.references?.length !== 0;
	const shouldShowDateDivider = useMemo(() => {
		return message.isStartedMessageOfTheDay;
	}, [message]);

	const checkMessageHasReply = useMemo(() => {
		if (message.references && message.references.length > 0) {
			return true;
		}
		return false;
	}, [message.references]);

	const checkMessageIncludeMention = useMemo(() => {
		return hasIncludeMention;
	}, [hasIncludeMention]);

	const jumpPinMessageId = useSelector(selectJumpPinMessageId);
	const checkJumpPinMessage = useMemo(() => {
		return jumpPinMessageId === message.id;
	}, [jumpPinMessageId, message.id]);

	const containerClass = classNames('relative', 'message-container', {
		'mt-3': !isCombine || checkReferences,
		'is-sending': message.isSending,
		'is-error': message.isError,
		'bg-[#383B47]': isHighlight
	});

	const parentDivClass = classNames(
		'flex h-15 flex-col w-auto px-3',
		{ 'mt-0': isMention },
		{ 'pt-[2px]': !isCombine },
		{ 'dark:bg-[#383B47]': hasIncludeMention || checkMessageTargetToMoved || checkJumpPinMessage },
		{
			'dark:bg-[#403D38] bg-[#EAB3081A]':
				(checkMessageIncludeMention || checkReplied) && !messageReplyHighlight && !checkJumpPinMessage && !checkMessageTargetToMoved
		},
		{
			'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]':
				!hasIncludeMention && !checkReplied && !checkMessageTargetToMoved && !messageReplyHighlight
		},
		{ 'bg-bgMessageReplyHighline': messageReplyHighlight }
	);

	const childDivClass = classNames(
		'absolute w-0.5 h-full left-0',
		{ 'bg-blue-500': messageReplyHighlight },
		{ 'bg-bgMentionReply': hasIncludeMention || checkReplied },
		{
			'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]':
				!hasIncludeMention && !checkReplied && !checkMessageTargetToMoved && !messageReplyHighlight
		}
	);
	const messageContentClass = classNames('flex flex-col whitespace-pre-wrap text-base w-full cursor-text');

	const handleOpenShortUser = useCallback(
		(e: React.MouseEvent<HTMLImageElement, MouseEvent>, userId: string) => {
			if (checkAnonymous) {
				return;
			}
			setShortUserId(userId);
			const heightPanel = mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? HEIGHT_PANEL_PROFILE : HEIGHT_PANEL_PROFILE_DM;
			if (window.innerHeight - e.clientY > heightPanel) {
				setPositionShortUser({
					top: e.clientY,
					left: WIDTH_CLAN_SIDE_BAR + WIDTH_CHANNEL_LIST_BOX + e.currentTarget.offsetWidth + 24
				});
			} else {
				setPositionShortUser({
					top: window.innerHeight - heightPanel,
					left: WIDTH_CLAN_SIDE_BAR + WIDTH_CHANNEL_LIST_BOX + e.currentTarget.offsetWidth + 24
				});
			}
			setIsShowPanelChannel(!isShowPanelChannel);
		},
		[checkAnonymous, mode]
	);
	const isDM = mode === ChannelStreamMode.STREAM_MODE_GROUP || mode === ChannelStreamMode.STREAM_MODE_DM;
	const avatar = useMemo(() => {
		if (isDM && shortUserId === senderId) {
			return avatarSender;
		}

		if (isDM) {
			return messageAvatarSenderRef;
		}

		if (shortUserId === senderId) {
			return userClanAvatar || avatarSender;
		}
	}, [userClanAvatar, avatarSender, shortUserId]);

	return (
		<>
			{shouldShowDateDivider && <MessageDateDivider message={message} />}
			{!shouldNotRender && (
				<HoverStateWrapper popup={popup}>
					<div className={containerClass} onContextMenu={onContextMenu} id={`msg-${message.id}`}>
						<div className="relative rounded-sm overflow-visible">
							<div className={childDivClass}></div>
							<div className={parentDivClass}>
								{checkMessageHasReply && (
									<MessageReply
										message={message}
										mode={mode}
										onClick={(e) => handleOpenShortUser(e, senderIdMessageRef as string)}
									/>
								)}
								<div
									className={`justify-start gap-4 inline-flex w-full relative h-fit overflow-visible ${isSearchMessage ? '' : 'pr-12'}`}
								>
									<MessageAvatar
										message={message}
										isCombine={isCombine}
										isEditing={isEditing}
										isShowFull={isShowFull}
										mode={mode}
										onClick={(e) => handleOpenShortUser(e, senderId)}
									/>
									<div className="w-full relative h-full">
										<MessageHead
											message={message}
											isCombine={isCombine}
											isShowFull={isShowFull}
											mode={mode}
											onClick={(e) => handleOpenShortUser(e, senderId)}
										/>
										<div className="justify-start items-center  inline-flex w-full h-full pt-[2px] textChat select-text">
											<div className={messageContentClass} style={{ wordBreak: 'break-word' }}>
												{isEditing && editor}
												{!isEditing && (
													<MessageContent
														message={message}
														isCombine={isCombine}
														isSending={message.isSending}
														isError={message.isError}
														mode={mode}
														isSearchMessage={isSearchMessage}
													/>
												)}

												<MessageAttachment mode={mode} message={message} onContextMenu={onContextMenu} />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<MessageReaction message={message} mode={mode} />
					</div>
				</HoverStateWrapper>
			)}
			{isShowPanelChannel && senderId !== '0' && allowDisplayShortProfile && shortUserId && (
				<div
					className={`fixed z-50 max-[480px]:!left-16 max-[700px]:!left-9 dark:bg-black bg-gray-200 w-[300px] max-w-[89vw] rounded-lg flex flex-col  duration-300 ease-in-out animate-fly_in`}
					style={{
						top: `${positionShortUser?.top}px`,
						...positionStyle
					}}
					ref={panelRef}
				>
					<ModalUserProfile
						onClose={() => setIsShowPanelChannel(false)}
						userID={shortUserId}
						classBanner="rounded-tl-lg rounded-tr-lg h-[105px]"
						message={message}
						mode={mode}
						positionType={''}
						avatar={avatar}
						name={userClanNickname || userDisplayName || username}
						isDM={isDM}
					/>
				</div>
			)}
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

interface HoverStateWrapperProps {
	children: ReactNode;
	popup?: ReactNode;
}

const HoverStateWrapper: React.FC<HoverStateWrapperProps> = ({ children, popup }) => {
	const [isHover, setIsHover] = useState(false);

	const handleMouseEnter = () => setIsHover(true);
	const handleMouseLeave = () => setIsHover(false);

	return (
		<div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			{children}
			{isHover && popup}
		</div>
	);
};
MessageWithUser.Skeleton = () => {
	return (
		<div role="status" className="flex items-start space-x-4 p-4 animate-pulse">
			{/* Avatar Skeleton with animation */}
			<div className="w-10 h-10 dark:bg-gray-500 bg-gray-200 rounded-full"></div>

			{/* Message Content Skeleton with animation */}
			<div className="flex-1 space-y-4 py-1">
				{/* Username Skeleton */}
				<div className="w-1/3 h-4 dark:bg-gray-500 bg-gray-200 rounded-lg"></div>

				{/* Text lines Skeleton */}
				<div className="space-y-2">
					<div className="w-full flex items-start space-x-2">
						<div className="h-4 dark:bg-gray-600 bg-gray-300 rounded-lg w-2/6"></div>
						<div className="h-4 dark:bg-gray-500 bg-gray-200 rounded-lg w-1/6"></div>
						<div className="h-4 dark:bg-gray-600 bg-gray-300 rounded-lg w-2/6"></div>
						<div className="h-4 dark:bg-gray-500 bg-gray-200 rounded-lg w-2/6"></div>
					</div>
					<div className="w-full flex items-start space-x-2">
						<div className="h-4 dark:bg-gray-500 bg-gray-200 rounded-lg w-1/6"></div>
						<div className="h-4 dark:bg-gray-600 bg-gray-300 rounded-lg w-2/6"></div>
						<div className="h-4 dark:bg-gray-500 bg-gray-200 rounded-lg w-1/6"></div>
						<div className="h-4 dark:bg-gray-600 bg-gray-300 rounded-lg w-2/6"></div>
					</div>
					<div className="w-5/6 flex items-start space-x-2">
						<div className="h-4 dark:bg-gray-600 bg-gray-300 rounded-lg w-3/6"></div>
						<div className="h-4 dark:bg-gray-600 bg-gray-300 rounded-lg w-2/6"></div>
						<div className="h-4 dark:bg-gray-500 bg-gray-200 rounded-lg w-1/6"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MessageWithUser;
