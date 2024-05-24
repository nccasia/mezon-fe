import { GifStickerEmojiPopup, ReactionBottom, UserReactionPanel } from '@mezon/components';
import { useChatReaction, useGifsStickersEmoji, useReference } from '@mezon/core';
import { EmojiDataOptionals, IMessageWithUser, SenderInfoOptionals, SubPanelName, calculateTotalCount } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';

type MessageReactionProps = {
	message: IMessageWithUser;
	currentChannelId: string;
	mode: number;
};

// TODO: refactor component for message lines
const MessageReaction: React.FC<MessageReactionProps> = ({ currentChannelId, message, mode }) => {
	const {
		userId,
		reactionMessageDispatch,
		reactionBottomState,
		dataReactionCombine,
		setReactionBottomState,
		setUserReactionPanelState,
		userReactionPanelState,
		reactionBottomStateResponsive,
	} = useChatReaction();

	const {
		referenceMessage,
		setReferenceMessage,
		setOpenReplyMessageState,
		setIdReferenceMessageReply,
		idMessageRefReply,
		openReplyMessageState,
		idMessageRefReaction,
		setIdReferenceMessageReaction,
	} = useReference();
	const smileButtonRef = useRef<HTMLDivElement | null>(null);
	const [showIconSmile, setShowIconSmile] = useState<boolean>(true);

	async function reactOnExistEmoji(
		id: string,
		mode: number,
		messageId: string,
		emoji: string,
		count: number,
		message_sender_id: string,
		action_delete: boolean,
	) {
		await reactionMessageDispatch('', mode ?? 2, messageId ?? '', emoji ?? '', 1, message_sender_id ?? '', false);
	}

	const checkMessageToMatchMessageRef = (message: IMessageWithUser) => {
		if (message.id === idMessageRefReaction) {
			return true;
		} else {
			return false;
		}
	};

	// For user reaction panel
	const [emojiShowUserReaction, setEmojiShowUserReaction] = useState<EmojiDataOptionals>();
	const checkEmojiToMatchWithEmojiHover = (emoji: EmojiDataOptionals) => {
		if (emoji.emoji === emojiShowUserReaction?.emoji) {
			return true;
		} else {
			return false;
		}
	};
	// Check position sender panel && emoji panel
	const childRef = useRef<(HTMLDivElement | null)[]>([]);
	const parentDiv = useRef<HTMLDivElement | null>(null);
	const [hoverEmoji, setHoverEmoji] = useState<EmojiDataOptionals>();
	const [showSenderPanelIn1s, setShowSenderPanelIn1s] = useState(true);
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();

	const handleOnEnterEmoji = (emojiParam: EmojiDataOptionals) => {
		setHoverEmoji(emojiParam);
		setUserReactionPanelState(true);
		setIdReferenceMessageReaction(message.id);
		setEmojiShowUserReaction(emojiParam);
		setShowSenderPanelIn1s(true);
		setShowIconSmile(true);
	};

	const handleOnleaveEmoji = () => {
		setUserReactionPanelState(false);
		if (subPanelActive === SubPanelName.NONE) {
			return setShowIconSmile(false);
		}
	};

	useEffect(() => {
		if (hoverEmoji) {
			checkPositionSenderPanel(hoverEmoji);
		}
	}, [hoverEmoji, parentDiv]);

	useEffect(() => {
		if (subPanelActive === SubPanelName.NONE) {
			return setShowIconSmile(false);
		}
		if (subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM) {
			return setShowIconSmile(true);
		}
	}, [subPanelActive]);

	const PANEL_SENDER_WIDTH = 300;

	const [posToRight, setPosToRight] = useState<boolean>(false);

	const emojiIndexMap: { [key: string]: number } = {};
	dataReactionCombine.forEach((emoji: EmojiDataOptionals, index: number) => {
		if (emoji.id !== undefined) {
			emojiIndexMap[emoji.id] = index;
		}
	});
	const checkPositionSenderPanel = (emoji: EmojiDataOptionals) => {
		if (!parentDiv.current || !childRef.current || emoji.id === undefined) return;
		const parentRect = parentDiv.current.getBoundingClientRect();
		const index = emojiIndexMap[emoji.id];
		if (index === undefined) return;
		const childElement = childRef.current[index];
		if (!childElement) return;
		const childRect = childElement.getBoundingClientRect();

		const distanceToRight = parentRect.right - childRect.right;
		const distanceRemainChildToParent = parentRect.width - distanceToRight;
		if (distanceRemainChildToParent < PANEL_SENDER_WIDTH) {
			return setPosToRight(false);
		} else {
			return setPosToRight(true);
		}
	};

	// For button smile
	const lastPositionEmoji = (emoji: EmojiDataOptionals, message: IMessageWithUser) => {
		const filterMessage = dataReactionCombine.filter((emojiFilter: EmojiDataOptionals) => emojiFilter.message_id === message.id);
		const indexEmoji = filterMessage.indexOf(emoji);
		if (indexEmoji === filterMessage.length - 1) {
			return true;
		} else {
			return false;
		}
	};

	// work in mobile
	useEffect(() => {
		if (showSenderPanelIn1s) {
			const timer = setTimeout(() => {
				setShowSenderPanelIn1s(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [showSenderPanelIn1s]);

	return (
		<div className="relative">
			{checkMessageToMatchMessageRef(message) && reactionBottomState && reactionBottomStateResponsive && (
				<div className={`w-fit md:hidden z-30 absolute bottom-0 block`}>
					<div className="scale-75 transform mb-0 z-20">
						<GifStickerEmojiPopup messageEmojiId={message.id} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />
					</div>
				</div>
			)}

			<div ref={parentDiv} className="flex flex-wrap  gap-2 whitespace-pre-wrap ml-14">
				{hoverEmoji && showSenderPanelIn1s && (
					<div className="hidden max-sm:block max-sm:-top-[0] absolute">
						{checkMessageToMatchMessageRef(message) && checkEmojiToMatchWithEmojiHover(hoverEmoji) && emojiShowUserReaction && (
							<UserReactionPanel emojiShowPanel={emojiShowUserReaction} mode={mode} message={message} />
						)}
					</div>
				)}

				{dataReactionCombine
					.filter((emojiFilter: EmojiDataOptionals) => emojiFilter.message_id === message.id)
					?.map((emoji: EmojiDataOptionals, index: number) => {
						const userSender = emoji.senders.find((sender: SenderInfoOptionals) => sender.sender_id === userId);
						const checkID = emoji.message_id === message.id;
						return (
							<div key={`${index + message.id}`}>
								{checkID && (
									<div
										ref={(element) => (childRef.current[index] = element)}
										className={` justify-center items-center relative
									${userSender?.count && userSender.count > 0 ? 'dark:bg-[#373A54] bg-gray-200 border-blue-600 border' : 'dark:bg-[#2B2D31] bg-bgLightMode border-[#313338]'}
									rounded-md w-fit min-w-12 gap-3 h-6 flex flex-row  items-center cursor-pointer`}
										onClick={() =>
											reactOnExistEmoji(
												emoji.id ?? '',
												ChannelStreamMode.STREAM_MODE_CHANNEL,
												message.id ?? '',
												emoji.emoji ?? '',
												1,
												userId ?? '',
												false,
											)
										}
										onMouseEnter={() => {
											handleOnEnterEmoji(emoji);
										}}
										onMouseLeave={() => {
											handleOnleaveEmoji();
										}}
									>
										<span className=" absolute left-[2px] ">{emoji.emoji}</span>
										<div className="text-[13px] top-[2px] ml-5 absolute justify-center text-center cursor-pointer dark:text-white text-black">
											<p>{calculateTotalCount(emoji.senders)}</p>
										</div>

										{checkMessageToMatchMessageRef(message) && showIconSmile && lastPositionEmoji(emoji, message) && (
											<ReactionBottom smileButtonRef={smileButtonRef} message={message} />
										)}

										{checkMessageToMatchMessageRef(message) &&
											userReactionPanelState &&
											checkEmojiToMatchWithEmojiHover(emoji) &&
											emojiShowUserReaction && (
												<div className="max-sm:hidden">
													<UserReactionPanel
														moveToRight={posToRight}
														emojiShowPanel={emojiShowUserReaction}
														mode={mode}
														message={message}
													/>
												</div>
											)}
									</div>
								)}
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default MessageReaction;
