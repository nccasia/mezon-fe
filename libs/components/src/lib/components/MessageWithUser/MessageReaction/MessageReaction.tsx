import { ReactionBottom, UserReactionPanel } from '@mezon/components';
import { useChatReaction, useReference } from '@mezon/core';
import { EmojiDataOptionals, EmojiPlaces, IMessageWithUser, SenderInfoOptionals, calculateTotalCount } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';

type MessageReactionProps = {
	message: IMessageWithUser;
	currentChannelId: string;
	mode: number;
};

// TODO: refactor component for message lines
const MessageReaction = ({ currentChannelId, message, mode }: MessageReactionProps) => {
	const {
		userId,
		reactionMessageDispatch,
		reactionBottomState,
		dataReactionCombine,
		setReactionBottomState,
		setUserReactionPanelState,
		userReactionPanelState,
		reactionPlaceActive,
	} = useChatReaction();

	const { referenceMessage, setReferenceMessage, setOpenReplyMessageState } = useReference();
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
		if (message.id === referenceMessage?.id) {
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

	const handleOnEnterEmoji = (emojiParam: EmojiDataOptionals, event: React.MouseEvent<HTMLDivElement>) => {
		setHoverEmoji(emojiParam);
		setReactionBottomState(true);
		setUserReactionPanelState(true);
		setReferenceMessage(message);
		setOpenReplyMessageState(false); //to hide Replymessage Component
		setEmojiShowUserReaction(emojiParam);
	};

	const handleOnleaveEmoji = () => {
		setUserReactionPanelState(false);
		if (reactionPlaceActive === EmojiPlaces.EMOJI_REACTION_BOTTOM) {
			setReactionBottomState(true);
		} else {
			setReactionBottomState(false);
		}
	};

	useEffect(() => {
		if (hoverEmoji) {
			checkPositionSenderPanel(hoverEmoji);
		}
	}, [hoverEmoji, parentDiv]);
	const PANEL_SENDER_WIDTH = 350;
	const EMOJI_REACTION_BOTTOM_PANEL = 376;

	const [posToRight, setPosToRight] = useState<boolean>(false);
	const [moveToTop, setMoveToTop] = useState<boolean>(false);

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
		if (distanceToRight < PANEL_SENDER_WIDTH) {
			return setPosToRight(true);
		} else {
			return setPosToRight(false);
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

	const smileButtonRef = useRef<HTMLDivElement | null>(null);

	const checkPosEmojiReactionPanel = () => {
		if (!parentDiv.current) return;
		const parentRect = parentDiv.current.getBoundingClientRect();
		const smileButton = smileButtonRef.current;
		if (!smileButton) return;
		const childRect = smileButton.getBoundingClientRect();
		const distanceToRight = parentRect.right - childRect.right;

		if (distanceToRight < EMOJI_REACTION_BOTTOM_PANEL) {
			setMoveToTop(true);
		} else {
			setMoveToTop(false);
		}
	};

	useEffect(() => {
		checkPosEmojiReactionPanel();
	}, [reactionBottomState]);

	return (
		<div ref={parentDiv} className="flex flex-wrap  gap-2 whitespace-pre-wrap ml-14">
			{dataReactionCombine
				.filter((emojiFilter: EmojiDataOptionals) => emojiFilter.message_id === message.id)
				?.map((emoji: EmojiDataOptionals, index: number) => {
					const userSender = emoji.senders.find((sender: SenderInfoOptionals) => sender.sender_id === userId);
					const checkID = emoji.message_id === message.id;
					return (
						<div key={index}>
							{checkID && (
								<div
									ref={(element) => (childRef.current[index] = element)}
									className={` justify-center items-center relative
									${userSender?.count && userSender.count > 0 ? 'bg-[#373A54] border-blue-600 border' : 'bg-[#313338] border-[#313338]'}
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
									onMouseEnter={(e) => {
										handleOnEnterEmoji(emoji, e);
									}}
									onMouseLeave={() => {
										handleOnleaveEmoji();
									}}
								>
									<span className=" relative left-[-10px] ">{emoji.emoji}</span>
									<div className="text-[13px] top-[2px] ml-5 absolute justify-center text-center cursor-pointer">
										<p>{calculateTotalCount(emoji.senders)}</p>
									</div>

									{checkMessageToMatchMessageRef(message) && reactionBottomState && lastPositionEmoji(emoji, message) && (
										<ReactionBottom smileButtonRef={smileButtonRef} moveToTop={moveToTop} message={message} />
									)}
									{checkMessageToMatchMessageRef(message) &&
										userReactionPanelState &&
										checkEmojiToMatchWithEmojiHover(emoji) &&
										emojiShowUserReaction && (
											<UserReactionPanel
												pos={posToRight}
												emojiShowPanel={emojiShowUserReaction}
												mode={mode}
												message={message}
											/>
										)}
								</div>
							)}
						</div>
					);
				})}
		</div>
	);
};

export default MessageReaction;
