import { ChatContext, useAppParams, useAuth, useChatReactionMessage } from '@mezon/core';
import { ChannelStreamMode } from '@mezon/mezon-js';
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
	mode: number;
	newMessage?: string;
};

type SenderInfoOptionals = {
	id: string;
	count: number;
	emojiIdList: string[];
	name?: string;
	avatar?: string;
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
	sender_avatar: string;
	sender_name: string;
};

function MessageWithUser({ message, preMessage, attachments, user, isMessNotifyMention, mode, newMessage }: MessageWithUserProps) {
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

		dataEmoji &&
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
							name: item.sender_name,
							avatar: item.sender_avatar,
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
								name: item.sender_name,
								avatar: item.sender_avatar,
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

	const handleReactMessage = async (
		id: string,
		mode: number,
		channelId: string,
		messageId: string,
		emoji: string,
		count: number,
		userId: string,
		message_sender_id: string,
	) => {
		const existingEmojiIndex = emojiDataIncSocket?.findIndex((e: EmojiDataOptionals) => e.emoji === emoji) as number;
		if (existingEmojiIndex !== -1) {
			const userIndex = (emojiDataIncSocket &&
				emojiDataIncSocket[existingEmojiIndex].senders.findIndex((sender) => sender.id === userId)) as number;
			if (userIndex !== -1) {
				const updatedEmojiData = [...emojiDataIncSocket];
				updatedEmojiData[existingEmojiIndex].senders[userIndex].count += 0;
				setEmojiData(updatedEmojiData);
				await reactionMessageAction(id, mode, messageId, emoji, count, message_sender_id, false);
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
				await reactionMessageAction(id, mode, messageId, emoji, count, message_sender_id, false);
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
			await reactionMessageAction(id, mode, messageId, emoji, 1, message_sender_id, false);
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

	const removeEmojiData = (emojiDataArr: EmojiDataOptionals[], emojiSocket: EmojiDataOptionals[]) => {
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
					const countToRemove = socketEmoji.senders[0].count;
					const remainingCount = emojiDataArr[existingEmojiIndex].senders[existingSenderIndex].count - countToRemove;

					if (remainingCount <= 0) {
						emojiDataArr[existingEmojiIndex].senders.splice(existingSenderIndex, 1);
					} else {
						emojiDataArr[existingEmojiIndex].senders[existingSenderIndex].count = remainingCount;
					}
				}
			}
		});

		return emojiDataArr;
	};

	const [emojiDataIncSocket, setEmojiDataIncSocket] = useState<EmojiDataOptionals[]>(
		processData(dataEmojiFetch, { channel_id: message.channel_id, id: message.id }),
	);
	const [reactedConvert, setReactConvert] = useState<EmojiDataOptionals[]>([]);
	const [removeObj, setRemoveObj] = useState<EmojiDataOptionals[]>([]);
	const [emojiRemoved, setEmojiRemoved] = useState<string>('');

	useEffect(() => {
		if (
			messageDataReactedFromSocket?.channelId &&
			messageDataReactedFromSocket.messageId &&
			messageDataReactedFromSocket.userId &&
			messageDataReactedFromSocket.emoji !== '' &&
			messageDataReactedFromSocket.actionRemove === false
		) {
			const reactDataArray: EmojiDataOptionals[] = [
				{
					id: messageDataReactedFromSocket?.id,
					emoji: messageDataReactedFromSocket?.emoji ?? '',
					senders: [
						{
							id: messageDataReactedFromSocket?.userId ?? '',
							count: messageDataReactedFromSocket.count ?? 1,
							emojiIdList: [],
						},
					],
					channelId: messageDataReactedFromSocket?.channelId ?? '',
					messageId: messageDataReactedFromSocket?.messageId ?? '',
				},
			];
			setReactConvert(reactDataArray);
			const updatedDataE = mergeEmojiData(emojiData, reactDataArray);
			setEmojiDataIncSocket([...updatedDataE]);
		} else if (
			messageDataReactedFromSocket?.channelId !== '' &&
			messageDataReactedFromSocket?.messageId !== '' &&
			messageDataReactedFromSocket?.userId !== '' &&
			messageDataReactedFromSocket?.emoji !== '' &&
			messageDataReactedFromSocket?.actionRemove === true
		) {
			const reactDataArray: EmojiDataOptionals[] = [
				{
					id: messageDataReactedFromSocket?.id,
					emoji: messageDataReactedFromSocket?.emoji ?? '',
					senders: [
						{
							id: messageDataReactedFromSocket?.userId ?? '',
							count: messageDataReactedFromSocket.count ?? 0,
							emojiIdList: [],
						},
					],
					channelId: messageDataReactedFromSocket?.channelId ?? '',
					messageId: messageDataReactedFromSocket?.messageId ?? '',
				},
			];
			setRemoveObj(reactDataArray);
			const updatedDataE = removeEmojiData(emojiData, reactDataArray);
			setEmojiDataIncSocket([...updatedDataE]);
		}
	}, [messageDataReactedFromSocket]);

	const { emojiSelectedReacted } = useContext(ChatContext);
	const [isReply, setIsReply] = useState<boolean>(true);
	const [messageIdRef] = useState<string>((message.references && message?.references[0]?.message_ref_id) ?? '');
	const getMessageRef = useSelector(selectMessageByMessageId(messageIdRef));
	const getSenderMessage = useSelector(selectMemberByUserId(getMessageRef?.sender_id));
	const [isMessRef, setIsMessRef] = useState<boolean>(false);
	const { messageRef, isOpenReply } = useContext(ChatContext);
	const { type } = useAppParams();
	const [ mod, setMod] = useState(0);
	useEffect(()=>{
		if (type === "2") {
			setMod(ChannelStreamMode.STREAM_MODE_GROUP)
		} else if (type === "3"){
			setMod(ChannelStreamMode.STREAM_MODE_DM)
		} else {
			setMod(ChannelStreamMode.STREAM_MODE_CHANNEL)
		}
	},[type])
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

	const { isOpenEmojiReacted, setIsOpenEmojiReacted } = useContext(ChatContext);

	useEffect(() => {
		if (messageRef?.id === message.id && emojiSelectedReacted)
			handleReactMessage(
				'',
				mod,
				currentChannelId ?? '',
				messageRef?.id ?? '',
				emojiSelectedReacted ?? '',
				1,
				userId ?? '',
				message.sender_id,
			);
	}, [messageRef?.id, emojiSelectedReacted]);

	const { setEmojiSelectedReacted, setMessageRef, isOpenEmojiReactedBottom, setIsOpenEmojiReactedBottom, setIsOpenEmojiMessBox } =
		useContext(ChatContext);

	const [isHovered, setIsHovered] = useState(false);
	const { setEmojiPlaceActive, emojiPlaceActive } = useContext(ChatContext);
	const [divWidth, setDivWidth] = useState<number | null>(null);
	const divRef = useRef<HTMLDivElement>(null);
	const childRef = useRef<(HTMLDivElement | null)[]>([]);
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
	}, [widthEmojiBar, widthMessageWithUser]);

	const [isHoverSender, setIsHoverSender] = useState<boolean>(false);
	const [isEmojiHover, setEmojiHover] = useState<any>();

	const getEmojiHover = (emojiParam: any) => {
		setIsHoverSender(true);
		setEmojiHover(emojiParam);
		setIsHideSmileButton(false);
	};

	type Props = {
		id: string;
	};
	function AvatarComponent({ id }: Props) {
		const user = useSelector(selectMemberByUserId(id));
		return <img src={user?.user?.avatar_url} className="w-8 h-8 rounded-full border border-gray-500 " alt={user?.user?.avatar_url} />;
	}
	function NameComponent({ id }: Props) {
		const user = useSelector(selectMemberByUserId(id));
		return <p className="text-xs text-white">{user?.user?.username}</p>;
	}

	const removeEmojiSender = async (
		id: string,
		channelId: string,
		messageId: string,
		emoji: string,
		message_sender_id: string,
		countRemoved: number,
	) => {
		setIsHideSmileButton(true);
		await reactionMessageAction('', mod, messageId, emoji, countRemoved, message_sender_id, true);
	};
	function removeSenderBySenderId(emojiData: EmojiDataOptionals, senderId: string) {
		if (emojiData.senders) {
			emojiData.senders = emojiData.senders.filter((sender) => sender.id !== senderId);
		}
		return emojiData;
	}

	const [isHideSmileButton, setIsHideSmileButton] = useState<boolean>(false);

	const calculateDistance = (index: number, bannerWidth: number) => {
		if (childRef.current && divMessageWithUser.current) {
			const grandParentDivRect = divMessageWithUser.current.getBoundingClientRect();
			const childDivRef = childRef.current[index];
			if (childDivRef) {
				const childDivRect = childDivRef.getBoundingClientRect();
				const compare = childDivRect.right + bannerWidth > grandParentDivRect.right;
				return compare;
			} else {
			}
		}
	};
	const calculateTotalCount = (senders: SenderInfoOptionals[]) => {
		return senders.reduce((sum: number, item: SenderInfoOptionals) => sum + item.count, 0);
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
				<div className={`flex h-15 flex-col   w-auto py-2 px-3 `}>
					{getSenderMessage && getMessageRef && message.references && message?.references?.length > 0 && (
						<div className="rounded flex flex-row gap-1 items-center justify-start w-fit text-[14px] ml-5 mb-[-5px] mt-1 replyMessage">
							<Icons.ReplyCorner />
							<div className="flex flex-row gap-1 mb-2 pr-12">
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
					<div className="justify-start gap-4 inline-flex w-full relative h-fit overflow-visible pr-12" ref={divMessageWithUser}>
						<MessageAvatar user={user} message={message} isCombine={isCombine} isReply={isReply} />
						<div className="flex-col w-full flex justify-center items-start relative ">
							<MessageHead message={message} user={user} isCombine={isCombine} isReply={isReply} />
							<div className="justify-start items-center inline-flex w-full textChat">
								<div
									className="flex flex-col gap-1 text-[#CCCCCC] font-['Manrope'] whitespace-pre-wrap text-[15px] w-fit cursor-text"
									style={{ wordBreak: 'break-word' }}
								>
									<MessageContent message={message} user={user} isCombine={isCombine} newMessage={newMessage} />
								</div>
							</div>
							<div
								ref={divRef}
								onMouseDown={(e) => e.preventDefault()}
								onMouseEnter={() => {
									return setIsHovered(true);
								}}
								onMouseLeave={() => setIsHovered(false)}
								className="flex justify-start flex-row w-fit gap-2 flex-wrap  pr-8 relative"
							>
								{emojiDataIncSocket &&
									emojiDataIncSocket
										.filter((obj) => obj.messageId === message.id)
										?.map((emoji: EmojiDataOptionals, index) => {
											const isRightMargin = calculateDistance(index, 288);
											const totalSenderCount = emoji.senders.reduce((sum, sender) => sum + sender.count, 0);
											const shouldHideEmoji = Math.abs(totalSenderCount) === 0;
											const userSender = emoji.senders.find((sender) => sender.id === userId);
											const checkID = emoji.channelId === message.channel_id && emoji.messageId === message.id;
											if (shouldHideEmoji) {
												return null;
											}
											return (
												<Fragment key={index}>
													{checkID && (
														<div
															ref={(element) => (childRef.current[index] = element)}
															className={` justify-center items-center relative 
													 		${userSender && userSender.count > 0 ? 'bg-[#373A54] border-blue-600 border' : 'bg-[#313338] border-[#313338]'}
													 		rounded-md w-fit min-w-12 gap-3 h-6 flex flex-row  items-center cursor-pointer`}
															onClick={() =>
																handleReactMessage(
																	emoji.id,
																	mod,
																	currentChannelId ?? '',
																	message.id,
																	emoji.emoji,
																	1,
																	userId ?? '',
																	message.sender_id,
																)
															}
															onMouseEnter={() => {
																return getEmojiHover(emoji);
															}}
															onMouseLeave={() => {
																setIsHoverSender(false);
															}}
														>
															<span className=" relative left-[-10px] ">{emoji.emoji}</span>
															<div className="text-[13px] top-[2px] ml-5 absolute justify-center text-center cursor-pointer">
																<p>{calculateTotalCount(emoji.senders)}</p>
															</div>

															{!isHideSmileButton &&
																emojiDataIncSocket.indexOf(emoji) === emojiDataIncSocket.length - 1 && (
																	<div onMouseEnter={() => setIsHovered(true)} className="absolute w-4 h-4">
																		<div className="bg-transparent w-8 flex flex-row items-center rounded-md cursor-pointer"></div>
																		<div
																			onClick={handleClickOpenEmojiBottom}
																			className={`bg-[#313338] border-[#313338] w-8 border px-2 flex flex-row items-center rounded-md cursor-pointer ml-[2.5rem] h-6 absolute bottom-[-0.25rem]
											 								${(isOpenEmojiReactedBottom && message.id === messageRef?.id) || isHovered ? 'block' : 'hidden'} `}
																			onMouseEnter={() => setIsHoverSender(false)}
																		>
																			<Icons.Smile
																				defaultSize="w-4 h-4"
																				defaultFill={
																					isOpenEmojiReactedBottom && message.id === messageRef?.id
																						? '#FFFFFF'
																						: '#AEAEAE'
																				}
																			/>
																		</div>

																		{isOpenEmojiReactedBottom && message.id === messageRef?.id && (
																			<div
																				className={`scale-75 transform ${calculateDistance(emojiDataIncSocket.length - 1, 373) ? 'ml-[-10rem]' : 'ml-10'} bottom-24 origin-left fixed z-50`}
																			>
																				<EmojiPicker
																					messageEmoji={message}
																					emojiAction={EmojiPlaces.EMOJI_REACTION_BOTTOM}
																				/>
																			</div>
																		)}
																	</div>
																)}

															{isHoverSender &&
																emoji.emoji === isEmojiHover.emoji &&
																emoji.messageId === message.id && (
																	<div
																		onMouseLeave={() => {
																			setIsHoverSender(false);
																		}}
																		onClick={(e) => e.stopPropagation()}
																		className={`absolute z-20  bottom-7 w-[18rem] 
															 		bg-[#313338] border-[#313338] rounded-md min-h-5 max-h-[25rem] border ${isRightMargin ? 'right-0' : 'left-0'}`}
																	>
																		<div className="flex flex-row items-center m-2">
																			<div className="">{isEmojiHover.emoji}</div>
																			<p className="text-sm">{calculateTotalCount(emoji.senders)}</p>
																			<button
																				className="right-3 absolute"
																				onClick={(e) => {
																					e.stopPropagation();
																					setIsHoverSender(false);
																				}}
																			>
																				<Icons.Close defaultSize="w-3 h-3" />
																			</button>
																		</div>

																		<hr className="h-[0.1rem] bg-blue-900 border-none"></hr>
																		{isEmojiHover.senders.map((item: any, index: number) => {
																			return (
																				<Fragment key={index}>
																					{item.count > 0 && (
																						<div
																							key={item.id}
																							className="m-2 flex flex-row  justify-start mb-2 items-center gap-2 relative "
																						>
																							<AvatarComponent id={item.id} />
																							<NameComponent id={item.id} />
																							<p className="text-xs absolute right-8">{item.count}</p>
																							{item.id === userId && (
																								<button
																									onClick={(e: any) => {
																										return (
																											e.stopPropagation(),
																											removeEmojiSender(
																												'',
																												currentChannelId ?? '',
																												message.id,
																												emoji.emoji,
																												item.id,
																												item.count,
																											),
																											removeSenderBySenderId(emoji, item.id)
																										);
																									}}
																									className="right-1 absolute"
																								>
																									<Icons.Close defaultSize="w-3 h-3" />
																								</button>
																							)}
																						</div>
																					)}
																				</Fragment>
																			);
																		})}
																		<div className="w-full h-3 absolute bottom-[-0.5rem]"></div>
																	</div>
																)}
														</div>
													)}
												</Fragment>
											);
										})}
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
