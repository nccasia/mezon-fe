import { useAuth, useChatReactionMessage } from '@mezon/core';
import { emojiActions, referencesActions, selectEmojiReactedBottomState, selectReference, useAppDispatch } from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { EmojiPickerPanel } from '@mezon/components';
import * as Icons from '../Icons/index';

type MessageReactionProps = {
	message: IMessageWithUser;
	currentChannelId: string;
	grandParentDivRect: any;
	mode: number;
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

// TODO: refactor component for message lines
const MessageReaction = ({ currentChannelId, message, grandParentDivRect, mode }: MessageReactionProps) => {
	const dispatch = useAppDispatch();
	const { userId } = useAuth();

	const isOpenEmojiReactedBottom = useSelector(selectEmojiReactedBottomState);
	const refMessage = useSelector(selectReference);

	const { messageDataReactedFromSocket, reactionMessageAction } = useChatReactionMessage({ currentChannelId });
	const [isHideSmileButton, setIsHideSmileButton] = useState<boolean>(false);

	const calculateDistance = (index: number, bannerWidth: number) => {
		if (childRef.current && grandParentDivRect) {
			const childDivRef = childRef.current[index];
			if (childDivRef) {
				const childDivRect = childDivRef.getBoundingClientRect();
				const compare = childDivRect.right + bannerWidth > grandParentDivRect.right;
				return compare;
			}
		}
	};

	const removeEmojiSender = async (
		id: string,
		channelId: string,
		messageId: string,
		emoji: string,
		message_sender_id: string,
		countRemoved: number,
	) => {
		setIsHideSmileButton(true);
		await reactionMessageAction('', mode, messageId, emoji, countRemoved, message_sender_id, true);
	};

	const removeSenderBySenderId = (emojiData: EmojiDataOptionals, senderId: string) => {
		if (emojiData.senders) {
			emojiData.senders = emojiData.senders.filter((sender) => sender.id !== senderId);
		}
		return emojiData;
	};

	const [dataEmojiFetch] = useState<any>(message.reactions);
	//TODO: do not convert here, use the mapReactionToEntity
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

	const [emojiDataIncSocket, setEmojiDataIncSocket] = useState<EmojiDataOptionals[]>(
		processData(dataEmojiFetch, { channel_id: message.channel_id, id: message.id }),
	);

	const setEmojiSelectedReacted = useCallback(
		(state: string) => {
			dispatch(emojiActions.setEmojiSelectedReacted(state));
		},
		[dispatch],
	);

	const setMessageRef = useCallback(
		(state: any) => {
			dispatch(referencesActions.setReference(state));
		},
		[dispatch],
	);

	const setIsOpenEmojiReacted = useCallback(
		(state: boolean) => {
			dispatch(emojiActions.setEmojiReactedState(state));
		},
		[dispatch],
	);

	const setIsOpenEmojiMessBox = useCallback(
		(state: boolean) => {
			dispatch(emojiActions.setEmojiMessBoxState);
		},
		[dispatch],
	);

	const setEmojiPlaceActive = useCallback(
		(state: EmojiPlaces) => {
			dispatch(emojiActions.setEmojiPlaceActive(state));
		},
		[dispatch],
	);

	const setIsOpenEmojiReactedBottom = useCallback(
		(state: boolean) => {
			dispatch(emojiActions.setEmojiMessBoxState);
		},
		[dispatch],
	);

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

	const calculateTotalCount = (senders: SenderInfoOptionals[]) => {
		return senders.reduce((sum: number, item: SenderInfoOptionals) => sum + item.count, 0);
	};

	const [isHovered, setIsHovered] = useState(false);
	//const [divWidth, setDivWidth] = useState<number | null>(null);
	//const divRef = useRef<HTMLDivElement>(null);
	const childRef = useRef<(HTMLDivElement | null)[]>([]);

	const handleClickOpenEmojiBottom = (event: React.MouseEvent<HTMLDivElement>) => {
		setIsOpenEmojiReacted(false);
		setIsOpenEmojiMessBox(false);
		setMessageRef(message);
		setEmojiPlaceActive(EmojiPlaces.EMOJI_REACTION_BOTTOM);
		setIsOpenEmojiReactedBottom(true);
		event.stopPropagation();
	};

	const [isHoverSender, setIsHoverSender] = useState<boolean>(false);
	const [isEmojiHover, setEmojiHover] = useState<any>();
	const getEmojiHover = (emojiParam: any) => {
		setIsHoverSender(true);
		setEmojiHover(emojiParam);
		setIsHideSmileButton(false);
	};

	//TODO: do not convert here, use the mapReactionToEntity
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
			//setReactConvert(reactDataArray);
			//const updatedDataE = mergeEmojiData(emojiData, reactDataArray);
			//setEmojiDataIncSocket([...updatedDataE]);
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
			//setRemoveObj(reactDataArray);
			//const updatedDataE = removeEmojiData(emojiData, reactDataArray);
			//setEmojiDataIncSocket([...updatedDataE]);
		}
	}, [messageDataReactedFromSocket]);

	return (
		<div>
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
												mode,
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

										{!isHideSmileButton && emojiDataIncSocket.indexOf(emoji) === emojiDataIncSocket.length - 1 && (
											<div onMouseEnter={() => setIsHovered(true)} className="absolute w-4 h-4">
												<div className="bg-transparent w-8 flex flex-row items-center rounded-md cursor-pointer"></div>
												<div
													onClick={handleClickOpenEmojiBottom}
													className={`bg-[#313338] border-[#313338] w-8 border px-2 flex flex-row items-center rounded-md cursor-pointer ml-[2.5rem] h-6 absolute bottom-[-0.25rem]
													${(isOpenEmojiReactedBottom && message.id === refMessage?.id) || isHovered ? 'block' : 'hidden'} `}
													onMouseEnter={() => setIsHoverSender(false)}
												>
													<Icons.Smile
														defaultSize="w-4 h-4"
														defaultFill={
															isOpenEmojiReactedBottom && message.id === refMessage?.id ? '#FFFFFF' : '#AEAEAE'
														}
													/>
												</div>

												{/* {isOpenEmojiReactedBottom && message.id === refMessage?.id && (
													<div
														className={`scale-75 transform ${calculateDistance(emojiDataIncSocket.length - 1, 373) ? 'ml-[-10rem]' : 'ml-10'} bottom-24 origin-left fixed z-50`}
													>
														<EmojiPickerPanel messageEmoji={message} emojiAction={EmojiPlaces.EMOJI_REACTION_BOTTOM} />
													</div>
												)} */}
											</div>
										)}

										{isHoverSender && emoji.emoji === isEmojiHover.emoji && emoji.messageId === message.id && (
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
	);
};

export default MessageReaction;
