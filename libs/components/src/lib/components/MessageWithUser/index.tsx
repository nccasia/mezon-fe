import { ChatContext, useAuth, useChatReactionMessage } from '@mezon/core';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageReaction, ApiMessageRef } from '@mezon/mezon-js/api.gen';
import { selectCurrentChannelId, selectMemberByUserId, selectMessageByMessageId } from '@mezon/store';
import { EmojiPlaces, IChannelMember, IMessageWithUser, TIME_COMBINE, checkSameDay, getTimeDifferenceInSeconds } from '@mezon/utils';
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import EmojiPicker from '../EmojiPicker';
import * as Icons from '../Icons/index';
import MessageAvatar from './MessageAvatar';
import MessageContent from './MessageContent';
import MessageHead from './MessageHead';
import { useMessageParser } from './useMessageParser';

export type ReactedOutsideOptional = {
	id: string;
	emoji?: string;
	messageId: string;
};

export type MessageWithUserProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	mentions?: Array<ApiMessageMention>;
	attachments?: Array<ApiMessageAttachment>;
	references?: Array<ApiMessageRef>;
	user?: IChannelMember | null;
	reactions?: Array<ApiMessageReaction>;
	isMessNotifyMention?: boolean;
};

type SenderInfoOptionals = {
	id: string;
	count: number;
	emojiIdList: string[];
};

type EmojiDataOptionals = {
	id: string;
	emoji: string;
	senders: SenderInfoOptionals[];
	channelId?: string;
	messageId?: string;
};

type EmojiItemOptionals = {
	id: string;
	sender_id: string;
	emoji: string;
	count: number;
};

function MessageWithUser({ message, preMessage, attachments, user, isMessNotifyMention }: MessageWithUserProps) {
	const { messageDate } = useMessageParser(message);
	const { userId } = useAuth();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { messageDataReactedFromSocket } = useChatReactionMessage({ currentChannelId });
	const { reactionMessageAction } = useChatReactionMessage({ currentChannelId });
	const isCombine = useMemo(() => {
		const timeDiff = getTimeDifferenceInSeconds(preMessage?.create_time as string, message?.create_time as string);
		return (
			timeDiff < TIME_COMBINE &&
			preMessage?.user?.id === message?.user?.id &&
			checkSameDay(preMessage?.create_time as string, message?.create_time as string)
		);
	}, [message, preMessage]);

	const [dataEmojiFetch] = useState<any>(message.reactions);

	const processData = (dataEmoji: EmojiItemOptionals[], message: { channel_id: string; id: string }) => {
		const result: EmojiDataOptionals[] = [];

		dataEmoji.length &&
			dataEmoji.forEach((item: EmojiItemOptionals) => {
				const existingEmoji = result.find((emojiItem: EmojiDataOptionals) => emojiItem.emoji === item.emoji);

				if (existingEmoji) {
					const existingSender = existingEmoji.senders.find((senderItem: SenderInfoOptionals) => senderItem.id === item.sender_id);

					if (existingSender) {
						existingSender.count += item.count || 1;
						existingSender.emojiIdList.push(item.id);
					} else {
						existingEmoji.senders.push({
							id: item.sender_id,
							count: item.count || 1,
							emojiIdList: [item.id],
						});
					}
				} else {
					result.push({
						id: item.id,
						emoji: item.emoji,
						senders: [
							{
								id: item.sender_id,
								count: item.count || 1,
								emojiIdList: [item.id],
							},
						],
						channelId: message.channel_id,
						messageId: message.id,
					});
				}
			});

		return result;
	};

	const [emojiData, setEmojiData] = useState<EmojiDataOptionals[]>(processData(dataEmojiFetch, { channel_id: message.channel_id, id: message.id }));

	const handleReactMessage = async (id: string, channelId: string, messageId: string, emoji: string, userId: string, message_sender_id: string) => {
		const existingEmojiIndex = emojiDataIncSocket?.findIndex((e: EmojiDataOptionals) => e.emoji === emoji) as number;
		if (existingEmojiIndex !== -1) {
			const userIndex = (emojiDataIncSocket &&
				emojiDataIncSocket[existingEmojiIndex].senders.findIndex((sender) => sender.id === userId)) as number;
			if (userIndex !== -1) {
				const updatedEmojiData = [...emojiDataIncSocket];
				updatedEmojiData[existingEmojiIndex].senders[userIndex].count += 0;
				setEmojiData(updatedEmojiData);
				await reactionMessageAction(id, channelId, messageId, emoji, message_sender_id, false);
				setEmojiSelectedReacted('');
				setMessageRef(undefined);
			} else {
				const updatedEmojiData = [...emojiDataIncSocket];
				updatedEmojiData[existingEmojiIndex].senders.push({
					id: userId,
					count: 0,
					emojiIdList: [],
				});
				setEmojiData(updatedEmojiData);
				await reactionMessageAction(id, channelId, messageId, emoji, message_sender_id, false);
				setEmojiSelectedReacted('');
				setMessageRef(undefined);
			}
		} else {
			setEmojiData((prevEmojiDataOptionals: EmojiDataOptionals[]) => [
				...prevEmojiDataOptionals,
				{
					id,
					emoji,
					count: 0,
					senders: [
						{
							id: userId,
							count: 0,
							emojiIdList: [],
						},
					],
					channelId: channelId,
					messageId: messageId,
				},
			]);
			await reactionMessageAction(id, channelId, messageId, emoji, message_sender_id, false);
			setEmojiSelectedReacted('');
			setMessageRef(undefined);
		}
	};

	const mergeEmojiData = (emojiDataArr: EmojiDataOptionals[], emojiSocket: EmojiDataOptionals[]) => {
		emojiSocket?.forEach((socketEmoji) => {
			const existingEmojiIndex = emojiDataArr.findIndex(
				(dataEmoji) =>
					dataEmoji.emoji === socketEmoji.emoji &&
					dataEmoji.channelId === socketEmoji.channelId &&
					dataEmoji.messageId === socketEmoji.messageId,
			);

			if (existingEmojiIndex !== -1) {
				const existingSenderIndex = emojiDataArr[existingEmojiIndex].senders.findIndex((sender) => sender.id === socketEmoji.senders[0].id);

				if (existingSenderIndex !== -1) {
					emojiDataArr[existingEmojiIndex].senders[existingSenderIndex].count += socketEmoji.senders[0].count;
				} else {
					emojiDataArr[existingEmojiIndex].senders.push(socketEmoji.senders[0]);
				}
			} else {
				emojiDataArr.push(socketEmoji);
			}
		});

		return emojiDataArr;
	};

	const [emojiDataIncSocket, setEmojiDataIncSocket] = useState<EmojiDataOptionals[]>(
		processData(dataEmojiFetch, { channel_id: message.channel_id, id: message.id }),
	);
	const [reactedConvert, setReactConvert] = useState<EmojiDataOptionals[]>([]);
	useEffect(() => {
		if (
			messageDataReactedFromSocket?.channelId &&
			messageDataReactedFromSocket.messageId &&
			messageDataReactedFromSocket.userId &&
			messageDataReactedFromSocket.emoji !== ''
		) {
			const reactDataArray: EmojiDataOptionals[] = [
				{
					id: messageDataReactedFromSocket?.id,
					emoji: messageDataReactedFromSocket?.emoji ?? '',
					senders: [
						{
							id: messageDataReactedFromSocket?.userId ?? '',
							count: 1,
							emojiIdList: [],
						},
					],
					channelId: messageDataReactedFromSocket?.channelId ?? '',
					messageId: messageDataReactedFromSocket?.messageId ?? '',
				},
			];
			setReactConvert(reactDataArray);
			const updatedDataE = mergeEmojiData(emojiData, reactDataArray);
			setEmojiDataIncSocket(updatedDataE);
		}
	}, [messageDataReactedFromSocket]);

	const { emojiSelectedReacted } = useContext(ChatContext);

	const [isReply, setIsReply] = useState<boolean>(true);
	const [messageIdRef] = useState<string>((message.references && message?.references[0]?.message_ref_id) ?? '');
	const getMessageRef = useSelector(selectMessageByMessageId(messageIdRef));
	const getSenderMessage = useSelector(selectMemberByUserId(getMessageRef?.sender_id));
	const [isMessRef, setIsMessRef] = useState<boolean>(false);
	const { messageRef, isOpenReply } = useContext(ChatContext);

	useEffect(() => {
		if (messageIdRef && getMessageRef && getSenderMessage) {
			setIsReply(true);
		} else {
			setIsReply(false);
		}

		if (message.id === messageRef?.id && isOpenReply) {
			setIsMessRef(true);
		} else if (message.id !== messageRef?.id || !isOpenReply) {
			setIsMessRef(false);
		}
	}, [messageIdRef, getMessageRef, getSenderMessage, messageRef, isOpenReply, message.id]);
	const [reactionOutside, setReactionOutside] = useState<ReactedOutsideOptional>();
	const { isOpenEmojiReacted, setIsOpenEmojiReacted } = useContext(ChatContext);

	useEffect(() => {
		if (messageRef?.id === message.id && emojiSelectedReacted)
			handleReactMessage('', currentChannelId ?? '', messageRef?.id ?? '', emojiSelectedReacted ?? '', userId ?? '', message.sender_id);
	}, [messageRef?.id, emojiSelectedReacted]);

	const { setEmojiSelectedReacted, setMessageRef, isOpenEmojiReactedBottom, setIsOpenEmojiReactedBottom, setIsOpenEmojiMessBox } =
		useContext(ChatContext);

	const [isHovered, setIsHovered] = useState(false);
	const { setEmojiPlaceActive, emojiPlaceActive } = useContext(ChatContext);
	const [divWidth, setDivWidth] = useState<number | null>(null);
	const divRef = useRef<HTMLDivElement>(null);
	const { widthEmojiBar, setWidthEmojiBar } = useContext(ChatContext);

	const handleClickOpenEmojiBottom = (event: React.MouseEvent<HTMLDivElement>) => {
		setIsOpenEmojiReacted(false);
		setIsOpenEmojiMessBox(false);
		setMessageRef(message);
		setEmojiPlaceActive(EmojiPlaces.EMOJI_REACTION_BOTTOM);
		setIsOpenEmojiReactedBottom(true);
		event.stopPropagation();
	};

	useEffect(() => {
		const handleResize = () => {
			if (divRef.current && message.id === messageRef?.id) {
				const width = divRef.current.offsetWidth;
				setDivWidth(width);
				setWidthEmojiBar(width);
			}
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [isOpenEmojiReactedBottom, message.id, isOpenEmojiReacted, messageRef?.id, isOpenEmojiReacted, emojiPlaceActive]);

	const divMessageWithUser = useRef<HTMLDivElement>(null);
	const widthMessageWithUser = divMessageWithUser?.current?.offsetWidth;
	const WIDTH_EMOJI_BOARD: number = 264;

	const [className, setClassName] = useState<string>('');
	useEffect(() => {
		if (widthMessageWithUser && widthMessageWithUser - widthEmojiBar < WIDTH_EMOJI_BOARD) {
			setClassName('right-0');
		} else {
			setClassName('ml-10');
		}
	}, [, widthEmojiBar, widthMessageWithUser]);

	const [isHoverSender, setIsHoverSender] = useState<boolean>(false);
	const [isEmojiHover, setEmojiHover] = useState<string>('');
	const getEmojiHover = (emojiParam: string) => {
		setEmojiHover(emojiParam);
		setIsHoverSender(true);
	};

	const removeEmojiHover = () => {
		setIsHoverSender(false);
		setEmojiHover('');
	};

	return (
		<>
			{!checkSameDay(preMessage?.create_time as string, message?.create_time as string) && !isMessNotifyMention && (
				<div className="flex flex-row w-full px-4 items-center py-3 text-zinc-400 text-[12px] font-[600]">
					<div className="w-full border-b-[1px] border-[#40444b] opacity-50 text-center"></div>
					<span className="text-center px-3 whitespace-nowrap">{messageDate}</span>
					<div className="w-full border-b-[1px] border-[#40444b] opacity-50 text-center"></div>
				</div>
			)}
			<div className={`${isMessRef ? 'bg-[#26262b] rounded-sm ' : ''}`}>
				<div className={`flex flex-col overflow-visible w-auto py-2 px-3 border border-green-500 `}>
					{getSenderMessage && getMessageRef && message.references && message?.references?.length > 0 && (
						<div className="rounded flex flex-row gap-1 items-center justify-start w-fit text-[14px] ml-5 mb-[-5px] mt-1 replyMessage">
							<Icons.ReplyCorner />
							<div className="flex flex-row gap-1 mb-2">
								<div className="w-5 h-5">
									<img
										className="rounded-full min-w-5 max-h-5 object-cover"
										src={getSenderMessage.user?.avatar_url}
										alt={getSenderMessage.user?.avatar_url}
									></img>
								</div>
								<p className="gap-1 flex">
									<span className=" text-[#84ADFF] font-bold hover:underline cursor-pointer tracking-wide">
										@{getSenderMessage.user?.username}{' '}
									</span>
									<span className="text-[13px] font-manrope hover:text-white cursor-pointer text-[#A8BAB8] one-line break-all">
										{' '}
										{getMessageRef?.content.t}
									</span>
								</p>
							</div>
						</div>
					)}
					<div className="justify-start gap-4 inline-flex w-full relative  overflow-visible" ref={divMessageWithUser}>
						<MessageAvatar user={user} message={message} isCombine={isCombine} isReply={isReply} />
						<div className="flex-col w-full flex justify-center items-start relative h-fit border overflow-visible z-0 ">
							<MessageHead message={message} user={user} isCombine={isCombine} isReply={isReply} />
							<div className="justify-start items-center inline-flex w-full">
								<div
									className="flex flex-col gap-1 text-[#CCCCCC] font-['Manrope'] whitespace-pre-wrap text-[15px] w-fit cursor-text"
									style={{ wordBreak: 'break-word' }}
								>
									<MessageContent message={message} user={user} isCombine={isCombine} />
								</div>
							</div>
							<div
								ref={divRef}
								onMouseDown={(e) => e.preventDefault()}
								onMouseEnter={() => setIsHovered(true)}
								onMouseLeave={() => setIsHovered(false)}
								className="flex justify-start flex-row w-fit gap-2 flex-wrap  pr-8 relative h-fit border"
							>
								{emojiDataIncSocket &&
									emojiDataIncSocket
										.filter((obj) => obj.messageId === message.id)
										?.map((emoji: EmojiDataOptionals, index) => {
											const userSender = emoji.senders.find((sender) => sender.id === userId);
											const checkID = emoji.channelId === message.channel_id && emoji.messageId === message.id;
											return (
												<Fragment key={index}>
													{checkID && (
														<div
															className={` justify-center items-center relative 

													 		${userSender && userSender.count > 0 ? 'bg-[#373A54] border-blue-600 border' : 'bg-[#313338] border-[#313338] '}
													 		rounded-md w-fit min-w-12 gap-3 h-6 flex flex-row  items-center cursor-pointer `}
															onMouseDown={(e) => e.preventDefault()}
															onMouseEnter={() => {
																return setIsHovered(true), getEmojiHover(emoji.emoji);
															}}
															onMouseLeave={() => removeEmojiHover()}
															onClick={() =>
																handleReactMessage(
																	emoji.id,
																	currentChannelId ?? '',
																	message.id,
																	emoji.emoji,
																	userId ?? '',
																	message.sender_id,
																)
															}
														>
															<span className=" relative left-[-10px]">{emoji.emoji}</span>
															<div className="text-[13px] top-[2px] ml-5 absolute justify-center text-center cursor-pointer">
																<p>{emoji.senders.reduce((sum, item: SenderInfoOptionals) => sum + item.count, 0)}</p>
															</div>
															{isHoverSender && emoji.emoji === isEmojiHover && (
																<div
																	className="absolute z-500  bottom-7 left-0 w-[15rem] border h-[5rem]
																 bg-[#313338] border-[#313338] rounded-sm"
																></div>
															)}
														</div>
													)}
												</Fragment>
											);
										})}
								{emojiDataIncSocket && emojiDataIncSocket.length > 0 && (
									<div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
										<div className="bg-transparent w-8 h-6  flex flex-row items-center rounded-md cursor-pointer absolute"></div>
										<div
											onClick={handleClickOpenEmojiBottom}
											className={`absolute top-0 right-0 bg-[#313338] border-[#313338] w-8 border h-6 px-2 flex flex-row items-center rounded-md cursor-pointer
											 ${(isOpenEmojiReactedBottom && message.id === messageRef?.id) || isHovered ? 'block' : 'hidden'} `}
										>
											<Icons.Smile
												defaultSize="w-4 h-4"
												defaultFill={isOpenEmojiReactedBottom && message.id === messageRef?.id ? '#FFFFFF' : '#AEAEAE'}
											/>
										</div>
										{isOpenEmojiReactedBottom && message.id === messageRef?.id && (
											<div className={`scale-75 transform ${className}  bottom-24 origin-left fixed z-50`}>
												<EmojiPicker messageEmoji={message} emojiAction={EmojiPlaces.EMOJI_REACTION_BOTTOM} />
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
					{message && !isMessNotifyMention && (
						<div
							className={`absolute top-[100] right-2 flex-row items-center gap-x-1 text-xs text-gray-600 ${isCombine ? 'hidden' : 'flex'}`}
						>
							<Icons.Sent />
						</div>
					)}
				</div>
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
