import { ChatContext } from '@mezon/core';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import { SuggestionMode } from 'emoji-picker-react';

import { useContext } from 'react';

export type EmojiPickerOptions = {
	// classNameParentDiv?: string;
	// classNameChildDiv?: string;
	messageEmoji?: IMessageWithUser;
	emojiAction?: EmojiPlaces;
};

function EmojiPickerComp(props: EmojiPickerOptions) {
	const { isOpenEmojiMessBox, setIsOpenEmojiMessBox } = useContext(ChatContext);
	const { isOpenEmojiReacted, setIsOpenEmojiReacted } = useContext(ChatContext);
	const {
		emojiSelectedReacted,
		setEmojiSelectedReacted,
		messageRef,
		setMessageRef,
		emojiPlaceActive,
		setEmojiPlaceActive,
		setEmojiSelectedMess,
		widthEmojiBar,
		setIsOpenEmojiReactedBottom,
		emojiSelectedMess,
	} = useContext(ChatContext);

	const handleEmojiSelect = (emojiData: EmojiClickData, event: MouseEvent) => {
		if (props.emojiAction === EmojiPlaces.EMOJI_REACTION || props.emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM) {
			setEmojiSelectedReacted(emojiData.emoji);
			setIsOpenEmojiReacted(false);
			setIsOpenEmojiReactedBottom(false);
			event.stopPropagation();
		} else if (props.emojiAction === EmojiPlaces.EMOJI_EDITOR) {
			setEmojiSelectedMess(emojiData.emoji);
			event.stopPropagation();
			setIsOpenEmojiMessBox(false);
			setIsOpenEmojiReactedBottom(false);
		}
	};
	return (
		<>

			<div onClick={(event) => event.stopPropagation()} className="z-20">
				<EmojiPicker suggestedEmojisMode={SuggestionMode.FREQUENT} onEmojiClick={handleEmojiSelect} width={500} theme={Theme.DARK} height={458} emojiStyle={EmojiStyle.NATIVE} />
			</div>
		</>
	);
}

export default EmojiPickerComp;
