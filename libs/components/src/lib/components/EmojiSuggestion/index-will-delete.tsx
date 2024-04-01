import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import { SuggestionMode } from 'emoji-picker-react';

export type EmojiPickerOptions = {
	// classNameParentDiv?: string;
	// classNameChildDiv?: string;
	messageEmoji?: IMessageWithUser;
	emojiAction?: EmojiPlaces;
};

function EmojiPickerComp(props: EmojiPickerOptions) {

	const handleEmojiSelect = (emojiData: EmojiClickData, event: MouseEvent) => {
		if (props.emojiAction === EmojiPlaces.EMOJI_REACTION || props.emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM) {
			
			event.stopPropagation();
		} else if (props.emojiAction === EmojiPlaces.EMOJI_EDITOR) {			
			event.stopPropagation();
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
