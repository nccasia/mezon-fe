import { GifStickerEmojiPopup, ReactionBottom, UserReactionPanel } from '@mezon/components';
import { useChatReaction, useEmojiSuggestion, useReference } from '@mezon/core';
import { selectDataSocketUpdate } from '@mezon/store';
import { EmojiDataOptionals, IMessageWithUser, calculateTotalCount } from '@mezon/utils';
import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ItemEmoji from './ItemEmoji';

type MessageReactionProps = {
	message: IMessageWithUser;
	mode: number;
};

// TODO: refactor component for message lines
const MessageReaction: React.FC<MessageReactionProps> = ({ message, mode }) => {
	const { reactionBottomState, reactionBottomStateResponsive, convertReactionToMatchInterface } = useChatReaction();
	const dataReactionSocket = useSelector(selectDataSocketUpdate);
	const getReactionsByMessageId = (data: EmojiDataOptionals[], mesId: string) => {
		return data.filter((item: any) => item.message_id === mesId);
	};
	const dataReaction = getReactionsByMessageId(convertReactionToMatchInterface, message.id);
	const { idMessageRefReaction, setIdReferenceMessageReaction } = useReference();

	const [showSenderPanelIn1s, setShowSenderPanelIn1s] = useState(true);

	const checkMessageToMatchMessageRef = (message: IMessageWithUser) => {
		if (message.id === idMessageRefReaction) {
			return true;
		} else {
			return false;
		}
	};
	const contentDiv = useRef<HTMLDivElement | null>(null);
	const [emojiShowUserReaction, setEmojiShowUserReaction] = useState<EmojiDataOptionals>();
	const checkEmojiToMatchWithEmojiHover = (emoji: EmojiDataOptionals) => {
		if (emoji.emoji === emojiShowUserReaction?.emoji) {
			return true;
		} else {
			return false;
		}
	};
	const [hoverEmoji, setHoverEmoji] = useState<EmojiDataOptionals | null>();
	const smileButtonRef = useRef<HTMLDivElement | null>(null);
	const [showIconSmile, setShowIconSmile] = useState<boolean>(false);
	const [checkHasEmoji, setCheckHasEmoji] = useState<boolean>(false);

	useLayoutEffect(() => {
		if (dataReaction.length === 0) {
			return setCheckHasEmoji(false);
		}
		const checkCount = calculateTotalCount(dataReaction[0]!.senders);
		const checkCountEmoji = () => {
			if (checkCount === 0) {
				setCheckHasEmoji(false);
			} else {
				setCheckHasEmoji(true);
			}
		};
		checkCountEmoji();
	}, [dataReaction]);

	return (
		<div className="relative pl-3">
			{checkMessageToMatchMessageRef(message) && reactionBottomState && reactionBottomStateResponsive && (
				<div className={`w-fit md:hidden z-30 absolute bottom-0 block`}>
					<div className="scale-75 transform mb-0 z-20">
						<GifStickerEmojiPopup messageEmojiId={message.id} mode={mode} />
					</div>
				</div>
			)}

			<div ref={contentDiv} className="flex  gap-2  ml-14">
				{showSenderPanelIn1s && (
					<div className="hidden max-sm:block max-sm:-top-[0] absolute">
						{hoverEmoji &&
							checkMessageToMatchMessageRef(message) &&
							checkEmojiToMatchWithEmojiHover(hoverEmoji) &&
							emojiShowUserReaction && <UserReactionPanel message={message} emojiShowPanel={emojiShowUserReaction} mode={mode} />}
					</div>
				)}

				<div
					className=" w-fit flex flex-wrap gap-2 whitespace-pre-wrap"
					onMouseEnter={() => setShowIconSmile(true)}
					onMouseLeave={() => setShowIconSmile(false)}
				>
					{dataReaction?.map((emoji: EmojiDataOptionals, index: number) => {
						return (
							<Fragment key={`${index + message.id}`}>
								<ItemEmoji message={message} mode={mode} emoji={emoji} />
							</Fragment>
						);
					})}
					{checkHasEmoji && (
						<div className="w-6 h-6  justify-center flex flex-row items-center cursor-pointer relative">
							{showIconSmile && <ReactionBottom smileButtonRef={smileButtonRef} />}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MessageReaction;
