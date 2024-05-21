import { Icons } from '@mezon/components';
import { useChatReaction, useReference } from '@mezon/core';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import { useCallback, useState } from 'react';

type ReactionBottomProps = {
	message: IMessageWithUser;
	smileButtonRef: React.RefObject<HTMLDivElement>;
};

const ReactionBottom = ({ message, smileButtonRef }: ReactionBottomProps) => {
	const {
		setReactionRightState,
		setReactionPlaceActive,
		setReactionBottomState,
		setUserReactionPanelState,
		setReactionBottomStateResponsive,
		setMessageMatchWithRef,
		setPositionOfSmileButton,
	} = useChatReaction();
	const { setReferenceMessage, idMessageRef, setIdReferenceMessage } = useReference();
	const [highlightColor, setHighLightColor] = useState('#AEAEAE');

	const checkMessageMatched = useCallback((msg: IMessageWithUser) => msg.id === idMessageRef, [idMessageRef]);

	const handleClickOpenEmojiBottom = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setMessageMatchWithRef(true);
			checkMessageMatched(message);
			setReactionRightState(false);
			// setReferenceMessage(message);
			setIdReferenceMessage(message.id);
			setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION_BOTTOM);
			setReactionBottomState(false);
			event.stopPropagation();
			setHighLightColor('#FFFFFF');
			setReactionBottomState(true);
			setUserReactionPanelState(false);
			setReactionBottomStateResponsive(true);
		},
		[
			message,
			setMessageMatchWithRef,
			checkMessageMatched,
			setReactionRightState,
			setReferenceMessage,
			setReactionPlaceActive,
			setReactionBottomState,
			setUserReactionPanelState,
			setReactionBottomStateResponsive,
		],
	);

	const setColorForIconSmile = useCallback(
		(msg: IMessageWithUser) => {
			if (checkMessageMatched(msg)) {
				return '#AEAEAE';
			} else if (highlightColor !== '#AEAEAE') {
				return highlightColor;
			}
			return '#AEAEAE';
		},
		[checkMessageMatched, highlightColor],
	);

	const handleHoverSmileButton = useCallback(() => {
		if (smileButtonRef.current) {
			const rect = smileButtonRef.current.getBoundingClientRect();
			setPositionOfSmileButton({
				top: rect.top,
				right: rect.right,
				left: rect.left,
				bottom: rect.bottom,
			});
		}
		setUserReactionPanelState(false);
	}, [smileButtonRef, setPositionOfSmileButton, setUserReactionPanelState]);

	return (
		<>
			{message.id === idMessageRef && (
				<div
					onMouseEnter={handleHoverSmileButton}
					onClick={handleClickOpenEmojiBottom}
					className="absolute w-8 h-4 pl-2 left-[100%] duration-100"
					ref={smileButtonRef}
				>
					<Icons.Smile defaultSize="w-4 h-4" defaultFill={setColorForIconSmile(message)} />
				</div>
			)}
		</>
	);
};

export default ReactionBottom;
