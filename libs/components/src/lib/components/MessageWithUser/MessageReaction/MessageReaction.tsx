import { GifStickerEmojiPopup, ReactionBottom } from '@mezon/components';
import { selectDataSocketUpdate, selectIdMessageRefReaction, selectReactionBottomState, selectReactionBottomStateResponsive } from '@mezon/store';
import { EmojiDataOptionals, IMessageWithUser, calculateTotalCount, convertReactionDataFromMessage, updateEmojiReactionData } from '@mezon/utils';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ItemEmoji from './ItemEmoji';

type MessageReactionProps = {
	message: IMessageWithUser;
	mode: number;
};

// TODO: refactor component for message lines
const MessageReaction: React.FC<MessageReactionProps> = ({ message, mode }) => {
	const smileButtonRef = useRef<HTMLDivElement | null>(null);
	const [showIconSmile, setShowIconSmile] = useState<boolean>(false);
	const [checkHasEmoji, setCheckHasEmoji] = useState<boolean>(false);
	const contentDiv = useRef<HTMLDivElement | null>(null);
	const reactionBottomState = useSelector(selectReactionBottomState);
	const reactionBottomStateResponsive = useSelector(selectReactionBottomStateResponsive);
	const idMessageRefReaction = useSelector(selectIdMessageRefReaction);
	const checkMessageToMatchMessageRef = (message: IMessageWithUser) => {
		if (message.id === idMessageRefReaction) {
			return true;
		} else {
			return false;
		}
	};
	const [reactionSocketByMessageId, setReationSocketByMessageId] = useState<EmojiDataOptionals[]>([]);
	function filterByMessageId(array: EmojiDataOptionals[], messageId: string) {
		return array.filter((item) => item.message_id === messageId);
	}
	const dataSocketConvert = useSelector(selectDataSocketUpdate);
	const [reactionMessage, setReactionMessage] = useState<EmojiDataOptionals[]>([]);
	const [dataReactionCombine, setDataReactionCombine] = useState<EmojiDataOptionals[]>([]);

	useEffect(() => {
		setReationSocketByMessageId(filterByMessageId(dataSocketConvert, message.id));
	}, [dataSocketConvert]);

	useEffect(() => {
		if (message.reactions && message.reactions?.length > 0) {
			const resultConverted = convertReactionDataFromMessage(message);
			setReactionMessage(resultConverted);
		}
	}, [message]);

	useEffect(() => {
		const sortedReactionMessage = [...reactionMessage].sort((a, b) => (a?.emoji || '').localeCompare(b?.emoji || ''));
		const combine = [...sortedReactionMessage, ...reactionSocketByMessageId];
		const result = updateEmojiReactionData(combine);
		setDataReactionCombine(result);
	}, [reactionSocketByMessageId, reactionMessage]);

	useLayoutEffect(() => {
		if (dataReactionCombine.length === 0) {
			return setCheckHasEmoji(false);
		}
		const checkCount = calculateTotalCount(dataReactionCombine[0]!.senders);
		const checkCountEmoji = () => {
			if (checkCount === 0) {
				setCheckHasEmoji(false);
			} else {
				setCheckHasEmoji(true);
			}
		};
		checkCountEmoji();
	}, [dataReactionCombine]);

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
				<div
					className=" w-fit flex flex-wrap gap-2 whitespace-pre-wrap"
					onMouseEnter={() => setShowIconSmile(true)}
					onMouseLeave={() => setShowIconSmile(false)}
				>
					{dataReactionCombine?.map((emoji: EmojiDataOptionals, index: number) => {
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
