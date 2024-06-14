import { GifStickerEmojiPopup, ReactionBottom, UserReactionPanel } from '@mezon/components';
import { useChatReaction, useEmojiSuggestion, useGifsStickersEmoji, useReference } from '@mezon/core';
import { EmojiDataOptionals, IMessageWithUser, SenderInfoOptionals, SubPanelName, calculateTotalCount, getSrcEmoji } from '@mezon/utils';
import { Fragment, useEffect, useRef, useState } from 'react';

type MessageReactionProps = {
	message: IMessageWithUser;
	currentChannelId: string;
	mode: number;
	dataReaction?: EmojiDataOptionals[] | [];
};

// TODO: refactor component for message lines
const MessageReaction: React.FC<MessageReactionProps> = ({ currentChannelId, message, mode, dataReaction }) => {
	const {
		userId,
		reactionMessageDispatch,
		reactionBottomState,
		setUserReactionPanelState,
		userReactionPanelState,
		reactionBottomStateResponsive,
		setArrowPosition,
	} = useChatReaction();

	const { idMessageRefReaction, setIdReferenceMessageReaction } = useReference();
	const smileButtonRef = useRef<HTMLDivElement | null>(null);
	const [showIconSmile, setShowIconSmile] = useState<boolean>(true);

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
	const userPanelDiv = useRef<HTMLDivElement | null>(null);
	const contentDiv = useRef<HTMLDivElement | null>(null);

	const [hoverEmoji, setHoverEmoji] = useState<EmojiDataOptionals | null>();
	const [showSenderPanelIn1s, setShowSenderPanelIn1s] = useState(true);
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();
	const [outOfRight, setOutRight] = useState<boolean>(false);

	const handleOnEnterEmoji = (emojiParam: EmojiDataOptionals, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.stopPropagation();
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

	const PANEL_SENDER_WIDTH = 300;
	const GAP_EMOJI = 8;

	const emojiIndexMap: { [key: string]: number } = {};

	dataReaction &&
		dataReaction.forEach((emoji: EmojiDataOptionals, index: number) => {
			if (emoji.emoji !== undefined) {
				emojiIndexMap[emoji.emoji] = index;
			}
		});

	const [topPanel, setTopPanel] = useState<any>();
	const [leftPanel, setLeftPanel] = useState<any>();

	const checkPositionSenderPanel = (emoji: EmojiDataOptionals) => {
		if (!childRef.current || !contentDiv.current || emoji.emoji === undefined || !userPanelDiv.current) return;
		const index = emojiIndexMap[emoji.emoji];
		if (index === undefined) return;
		const childElement = childRef.current[index];
		if (!childElement) return;
		const leftEmojiDistance = childElement.getBoundingClientRect().left;
		const widthEmojiElement = childElement.getBoundingClientRect().width;
		const distanceEmojiToRightScreen = window.innerWidth - leftEmojiDistance - widthEmojiElement;
		const conditionOutOfRight = PANEL_SENDER_WIDTH / 2 - widthEmojiElement / 2;
		if (distanceEmojiToRightScreen < conditionOutOfRight) {
			setOutRight(true);
			setArrowPosition(true);
		} else {
			setOutRight(false);
			setArrowPosition(false);
		}
		const wrapperEmojiLeftDistance = contentDiv.current.getBoundingClientRect().left;
		const wrapperEmojiTopDistance = contentDiv.current.getBoundingClientRect().top;

		setTopPanel(wrapperEmojiTopDistance - userPanelDiv.current.getBoundingClientRect().height - 5);

		if (leftEmojiDistance === wrapperEmojiLeftDistance) {
			setLeftPanel(leftEmojiDistance - PANEL_SENDER_WIDTH / 2 + widthEmojiElement / 2);
		} else {
			setLeftPanel(leftEmojiDistance - PANEL_SENDER_WIDTH / 2 + widthEmojiElement / 2 + GAP_EMOJI);
		}
	};

	// For button smile
	const lastPositionEmoji = (emoji: EmojiDataOptionals, message: IMessageWithUser) => {
		const filterMessage = dataReaction && dataReaction.filter((emojiFilter: EmojiDataOptionals) => emojiFilter.message_id === message.id);
		const indexEmoji = filterMessage?.indexOf(emoji);
		if (filterMessage && indexEmoji === filterMessage?.length - 1) {
			return true;
		} else {
			return false;
		}
	};

	useEffect(() => {
		if (hoverEmoji) {
			checkPositionSenderPanel(hoverEmoji);
		}
	}, [hoverEmoji?.message_id, hoverEmoji?.emoji, childRef]);

	useEffect(() => {
		if (subPanelActive === SubPanelName.NONE) {
			return setShowIconSmile(false);
		}
		if (subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM) {
			return setShowIconSmile(true);
		}
	}, [subPanelActive]);

	useEffect(() => {
		if (!userReactionPanelState && window.innerWidth > 640) {
			setHoverEmoji(null);
		}
	}, [userReactionPanelState]);

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
						<GifStickerEmojiPopup messageEmojiId={message.id} mode={mode} />
					</div>
				</div>
			)}

			<div ref={contentDiv} className="flex flex-wrap  gap-2 whitespace-pre-wrap ml-16  ">
				{showSenderPanelIn1s && (
					<div className="hidden max-sm:block max-sm:-top-[0] absolute">
						{hoverEmoji &&
							checkMessageToMatchMessageRef(message) &&
							checkEmojiToMatchWithEmojiHover(hoverEmoji) &&
							emojiShowUserReaction && <UserReactionPanel emojiShowPanel={emojiShowUserReaction} mode={mode} message={message} />}
					</div>
				)}

				{dataReaction?.map((emoji: EmojiDataOptionals, index: number) => {
					const userSender = emoji.senders.find((sender: SenderInfoOptionals) => sender.sender_id === userId);
					const hasUserReaction = userSender?.count && userSender?.count > 0 ? true : false;
					const totalCount = calculateTotalCount(emoji.senders);
					return (
						<Fragment key={`${index + message.id}`}>
							{totalCount > 0 && (
								<div ref={(element) => (childRef.current[index] = element)}>
									<EmojiItem
										hasUserReaction={hasUserReaction}
										onMouseEnter={(event) => {
											handleOnEnterEmoji(emoji, event);
										}}
										onMouseLeave={handleOnleaveEmoji}
										count={totalCount}
										emojiShortName={emoji.emoji ?? ''}
										mode={mode}
										messageId={message.id}
										emojiId={emoji.id ?? ''}
									/>

									{checkMessageToMatchMessageRef(message) && showIconSmile && lastPositionEmoji(emoji, message) && (
										<ReactionBottom smileButtonRef={smileButtonRef} message={message} />
									)}

									{checkMessageToMatchMessageRef(message) &&
										userReactionPanelState &&
										checkEmojiToMatchWithEmojiHover(emoji) &&
										emojiShowUserReaction && (
											<div
												ref={userPanelDiv}
												className="max-sm:hidden z-50 h-fit"
												style={{
													position: 'fixed',
													top: topPanel,
													left: outOfRight ? leftPanel - 120 : leftPanel,
												}}
											>
												<UserReactionPanel emojiShowPanel={emojiShowUserReaction} mode={mode} message={message} />
											</div>
										)}
								</div>
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
};

export default MessageReaction;

type EmojiItemOpt = {
	count: number;
	emojiShortName: string;
	mode: number;
	messageId: string;
	emojiId: string;
	onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	onMouseLeave?: () => void;
	hasUserReaction: boolean | undefined;
};

const EmojiItem = ({ count, emojiShortName, mode, messageId, emojiId, onMouseEnter, onMouseLeave, hasUserReaction }: EmojiItemOpt) => {
	const { emojiListPNG } = useEmojiSuggestion();
	const getUrlEmoji = getSrcEmoji(emojiShortName, emojiListPNG);
	const { reactionMessageDispatch, userId } = useChatReaction();

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

	return (
		<button
			onClick={() => reactOnExistEmoji(emojiId ?? '', mode, messageId ?? '', emojiShortName ?? '', 1, userId ?? '', false)}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={` justify-center items-center relative 
				${hasUserReaction ? 'dark:bg-[#373A54] bg-gray-200 border-blue-600 border' : 'dark:bg-[#2B2D31] bg-bgLightMode border-[#313338]'}
				rounded-sm w-fit min-w-12 gap-3 h-6 flex flex-row  items-center cursor-pointer`}
		>
			<span className=" absolute left-[5px] ">
				{' '}
				<img src={getUrlEmoji} className="w-4 h-4"></img>{' '}
			</span>
			<div className="text-[13px] font-medium top-[2px] ml-5 absolute justify-center text-center cursor-pointer dark:text-white text-black">
				<p>{count}</p>
			</div>
		</button>
	);
};
