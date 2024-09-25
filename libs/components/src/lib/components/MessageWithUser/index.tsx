import { useAuth, useOnClickOutside } from '@mezon/core';
import { MessagesEntity, selectCurrentChannelId, selectDmGroupCurrentId, selectJumpPinMessageId } from '@mezon/store';
import { HEIGHT_PANEL_PROFILE, HEIGHT_PANEL_PROFILE_DM, WIDTH_CHANNEL_LIST_BOX, WIDTH_CLAN_SIDE_BAR } from '@mezon/utils';
import classNames from 'classnames';
import { ChannelStreamMode } from 'mezon-js';
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
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
	isMessNotifyMention?: boolean;
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
	isMessNotifyMention,
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
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { senderId, username, userClanAvatar, userClanNickname, userDisplayName } = useMessageParser(message);
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionShortUser, setPositionShortUser] = useState<{ top: number; left: number } | null>(null);

	const checkAnonymous = useMemo(() => message?.sender_id === NX_CHAT_APP_ANNONYMOUS_USER_ID, [message?.sender_id]);

	const handleOpenShortUser = useCallback(
		(e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
			if (checkAnonymous) {
				return;
			}
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
		[message.message_id]
	);
	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));

	const userLogin = useAuth();
	const isCombine = !message.isStartedMessageGroup;
	const checkReplied = false;
	const checkMessageTargetToMoved = false;
	const currentDmId = useSelector(selectDmGroupCurrentId);

	const currentDmOrChannelId = useMemo(
		() => (mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? currentChannelId : currentDmId),
		[currentChannelId, currentDmId, mode]
	);
	// Computed values
	const attachments = message.attachments ?? [];
	const mentions = message.mentions ?? [];
	const hasFailedAttachment = attachments.length === 1 && attachments[0].filename === 'failAttachment' && attachments[0].filetype === 'unknown';
	const isMeMessage = message.isMe;

	const shouldNotRender = useMemo(() => {
		return hasFailedAttachment && !isMeMessage && Object.keys(message.content).length === 0 && mentions.length === 0;
	}, [hasFailedAttachment, isMeMessage, message.content, mentions]);

	const hasIncludeMention = useMemo(() => {
		const userIdMention = userLogin.userProfile?.user?.id;
		const mentionOnMessage = message.mentions;
		let includesHere = false;
		if (typeof message.content.t == 'string') {
			includesHere = message.content.t?.includes('@here');
		}
		const includesUser = mentionOnMessage?.some((mention) => mention.user_id === userIdMention);
		return includesHere || includesUser;
	}, [message.content.t, userLogin.userProfile?.user?.id, message.mentions]);

	const checkReferences = message.references?.length !== 0;
	const shouldShowDateDivider = useMemo(() => {
		return message.isStartedMessageOfTheDay;
	}, [message]);

	const checkMessageHasReply = useMemo(() => {
		if (message.references && message.references.length > 0) {
			return message.references[0]?.message_ref_id !== undefined;
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
		{ 'dark:bg-[#383B47]': hasIncludeMention || checkReplied || checkMessageTargetToMoved },
		{ 'dark:bg-[#403D38] bg-[#EAB3081A]': checkMessageIncludeMention || checkJumpPinMessage },
		{ 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]': !hasIncludeMention && !checkReplied && !checkMessageTargetToMoved }
	);

	const childDivClass = classNames(
		'absolute w-0.5 h-full left-0',
		{ 'dark:bg-blue-500': hasIncludeMention || checkReplied || checkMessageTargetToMoved },
		{ 'bg-[#403D38]': hasIncludeMention },
		{ 'dark:group-hover:bg-bgPrimary1 group-hover:bg-[#EAB3081A]': !hasIncludeMention && !checkReplied && !checkMessageTargetToMoved }
	);
	const messageContentClass = classNames('flex flex-col whitespace-pre-wrap text-base w-full cursor-text');
	return (
		<>
			{shouldShowDateDivider && <MessageDateDivider message={message} />}
			{!shouldNotRender && (
				<HoverStateWrapper popup={popup}>
					<div className={containerClass} onContextMenu={onContextMenu} id={`msg-${message.id}`}>
						<div className="relative rounded-sm overflow-visible">
							<div className={childDivClass}></div>
							<div className={parentDivClass}>
								{checkMessageHasReply && <MessageReply message={message} mode={mode} onClick={handleOpenShortUser} />}
								<div
									className={`justify-start gap-4 inline-flex w-full relative h-fit overflow-visible ${isSearchMessage ? '' : 'pr-12'}`}
								>
									<MessageAvatar
										message={message}
										isCombine={isCombine}
										isEditing={isEditing}
										isShowFull={isShowFull}
										mode={mode}
										onClick={handleOpenShortUser}
									/>
									<div className="w-full relative h-full">
										<MessageHead
											message={message}
											isCombine={isCombine}
											isShowFull={isShowFull}
											mode={mode}
											onClick={handleOpenShortUser}
										/>
										<div className="justify-start items-center  inline-flex w-full h-full pt-[2px] textChat">
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
			{isShowPanelChannel && allowDisplayShortProfile && (
				<div
					className={`fixed z-50 max-[480px]:!left-16 max-[700px]:!left-9 dark:bg-black bg-gray-200 w-[300px] max-w-[89vw] rounded-lg flex flex-col  duration-300 ease-in-out`}
					style={{
						top: `${positionShortUser?.top}px`,
						left: `${positionShortUser?.left}px`
					}}
					ref={panelRef}
				>
					<ModalUserProfile
						userID={senderId}
						classBanner="rounded-tl-lg rounded-tr-lg h-[105px]"
						message={message}
						mode={mode}
						positionType={''}
						avatar={userClanAvatar}
						name={userClanNickname || userDisplayName || username}
						isDM={mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? true : false}
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
		<div className="flex py-0.5 min-w-min mx-3 h-15 mt-3 hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer flex-shrink-1">
			<Skeleton circle={true} width={38} height={38} />
		</div>
	);
};

export default MessageWithUser;
