import { ChatContext, useAuth, useChatReactionMessage } from '@mezon/core';
import { selectCurrentChannelId, selectMemberByUserId, selectMessageByMessageId } from '@mezon/store';
import { IChannelMember, IMessageWithUser, TIME_COMBINE, checkSameDay, getTimeDifferenceInSeconds } from '@mezon/utils';
import { ReactedOutsideOptional } from 'apps/chat/src/app/pages/channel/ChannelMessage';
import { useContext, useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageReaction, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
import * as Icons from '../Icons/index';
import MessageAvatar from './MessageAvatar';
import MessageContent from './MessageContent';
import MessageHead from './MessageHead';
import { useMessageParser } from './useMessageParser';

export type MessageWithUserProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	mentions?: Array<ApiMessageMention>;
	attachments?: Array<ApiMessageAttachment>;
	references?: Array<ApiMessageRef>;
	user?: IChannelMember | null;
	reactions?: Array<ApiMessageReaction>;
	reactionOutsideProps?: ReactedOutsideOptional;
	isMessNotifyMention?: boolean
};

type SenderInfoOptionals = {
	id: string;
	count: number;
	emojiIdList: string[];
};

type EmojiDataOptionals = {
	emoji: string;
	senders: SenderInfoOptionals[];
	channelId?: string;
	messageId?: string;
};

type EmojiItemOptionals = {
	id: string;
	sender_id: string;
	emoji: string;
};

function MessageWithUser({ message, preMessage, attachments, reactionOutsideProps, user, isMessNotifyMention }: MessageWithUserProps) {
	const { messageTime } = useMessageParser(message);
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
	const processData = (dataEmoji: any) => {
		const result: EmojiDataOptionals[] = [];
		dataEmoji.forEach((item: EmojiItemOptionals) => {
			const existingEmoji = result.find((emojiItem: EmojiDataOptionals) => emojiItem.emoji === item.emoji);

			if (existingEmoji) {
				const existingSender = existingEmoji.senders.find((senderItem: SenderInfoOptionals) => senderItem.id === item.sender_id);
				if (existingSender) {
					existingSender.count += 1;
					existingSender.emojiIdList.push(item.id);
				} else {
					existingEmoji.senders.push({
						id: item.sender_id,
						count: 1,
						emojiIdList: [item.id],
					});
				}
			} else {
				result.push({
					emoji: item.emoji,
					senders: [
						{
							id: item.sender_id,
							count: 1,
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

	const [emojiData, setEmojiData] = useState<EmojiDataOptionals[]>(processData(dataEmojiFetch));
	const handleReactMessage = async (channelId: string, messageId: string, emoji: string, userId: string) => {
		const existingEmojiIndex = emojiDataIncSocket?.findIndex((e: EmojiDataOptionals) => e.emoji === emoji) as number;
		if (existingEmojiIndex !== -1) {
			const userIndex = (emojiDataIncSocket &&
				emojiDataIncSocket[existingEmojiIndex].senders.findIndex((sender) => sender.id === userId)) as number;
			if (userIndex !== -1) {
				const updatedEmojiData = [...emojiDataIncSocket];
				updatedEmojiData[existingEmojiIndex].senders[userIndex].count += 0;
				setEmojiData(updatedEmojiData);
				await reactionMessageAction(channelId, messageId, emoji, false);
			} else {
				const updatedEmojiData = [...emojiDataIncSocket];
				updatedEmojiData[existingEmojiIndex].senders.push({
					id: userId,
					count: 0,
					emojiIdList: [],
				});
				setEmojiData(updatedEmojiData);
				await reactionMessageAction(channelId, messageId, emoji, false);
			}
		} else {
			setEmojiData((prevEmojiDataOptionals: EmojiDataOptionals[]) => [
				...prevEmojiDataOptionals,
				{
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
			await reactionMessageAction(channelId, messageId, emoji, false);
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

	const [emojiDataIncSocket, setEmojiDataIncSocket] = useState<EmojiDataOptionals[]>(processData(dataEmojiFetch));
	const [reactedConvert, setReactConvert] = useState<EmojiDataOptionals[]>([]);
	useEffect(() => {
		if (
			messageDataReactedFromSocket?.channelId &&
			messageDataReactedFromSocket.messageId &&
			messageDataReactedFromSocket.userId &&
			messageDataReactedFromSocket.emoji
		) {
			const reactDataArray: EmojiDataOptionals[] = [
				{
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

	useEffect(() => {
		if (reactionOutsideProps?.messageId && reactionOutsideProps?.emoji && userId) {
			handleReactMessage(currentChannelId ?? '', reactionOutsideProps?.messageId, reactionOutsideProps?.emoji, userId);
			return;
		}
	}, [reactionOutsideProps?.emoji, reactionOutsideProps?.messageId]);

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

		if (message.message_id === messageRef.message_id && isOpenReply) {
			setIsMessRef(true);
		} else if (message.message_id !== messageRef.message_id || !isOpenReply) {
			setIsMessRef(false);
		}
	}, [messageIdRef, getMessageRef, getSenderMessage, messageRef, isOpenReply, message.message_id]);

	return (
		<>
			{!checkSameDay(preMessage?.create_time as string, message?.create_time as string) && !isMessNotifyMention && (
				<div className="flex flex-row w-full px-4 items-center py-3 text-zinc-400 text-[12px] font-[600]">
					<div className="w-full border-b-[1px] border-[#40444b] opacity-50 text-center"></div>
					<span className="text-center px-3 whitespace-nowrap">{messageTime}</span>
					<div className="w-full border-b-[1px] border-[#40444b] opacity-50 text-center"></div>
				</div>
			)}

			<div
				className={`flex py-0.5 h-15 flex-col group hover:bg-gray-950/[.07] ${isMessRef ? 'bg-[#393B47] rounded-sm' : ''} overflow-x-hidden cursor-pointer ml-4 relative w-auto mr-4 ${isCombine ? '' : 'mt-3'}`}
			>
				{getSenderMessage && getMessageRef && message.references && message?.references?.length > 0 && (
					<div className="rounded flex flex-row gap-1 items-center justify-start w-fit text-[14px] ml-5 mb-[-5px] mt-1">
						<Icons.ReplyCorner />
						<div className="flex flex-row gap-1 mb-2">
							<div className="w-5 h-5">
								<img className="rounded-full" src={getSenderMessage.user?.avatar_url} alt={getSenderMessage.user?.avatar_url}></img>
							</div>
							<p className="gap-1">
								<span className=" text-[#84ADFF] font-bold">@{getSenderMessage.user?.username} </span>
								<span className="text-[13px] font-manrope"> {getMessageRef?.content.t}</span>
							</p>
						</div>
					</div>
				)}
				<div className="justify-start gap-4 inline-flex w-full relative">
					<MessageAvatar user={user} message={message} isCombine={isCombine} isReply={isReply} />
					<div className="flex-col w-full flex justify-center items-start relative gap-1">
						<MessageHead message={message} user={user} isCombine={isCombine} isReply={isReply} />
						<div className="justify-start items-center inline-flex w-full">
							<div className="flex flex-col gap-1 text-[#CCCCCC] font-['Manrope'] whitespace-pre-wrap text-[15px] w-widthMessageTextChat break-all">
								<MessageContent message={message} user={user} isCombine={isCombine} />
							</div>
						</div>
						<div className="flex justify-start flex-row w-full gap-2 flex-wrap">
							{emojiDataIncSocket &&
								emojiDataIncSocket.map((emoji: EmojiDataOptionals) => {
									const userSender = emoji.senders.find((sender) => sender.id === userId);
									const checkID = emoji.channelId === message.channel_id && emoji.messageId === message.id;
									const uniqueKey = uuidv4();
									return (
										<div key={uniqueKey}>
											{checkID && (
												<div
													className={`relative ${userSender && userSender.count > 0 ? 'bg-[#373A54] border-blue-600 border' : 'bg-[#313338]'} rounded-md w-12 gap-1 h-5 flex flex-row justify-center items-center`}
													onClick={() => handleReactMessage(currentChannelId ?? '', message.id, emoji.emoji, userId ?? '')}
												>
													<span>{emoji.emoji}</span>
													<span className="font-manrope flex flex-row items-center justify-center pt-[2px] relative">
														<p className="text-[13px]">
															{emoji.senders.reduce((sum, item: SenderInfoOptionals) => sum + item.count, 0)}
														</p>
													</span>
												</div>
											)}
										</div>
									);
								})}
						</div>
					</div>
				</div>
				{message && !isMessNotifyMention && (
					<div
						className={`absolute top-[100] right-2  flex-row items-center gap-x-1 text-xs text-gray-600 ${isCombine ? 'hidden' : 'flex'}`}
					>
						<Icons.Sent />
					</div>
				)}
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
