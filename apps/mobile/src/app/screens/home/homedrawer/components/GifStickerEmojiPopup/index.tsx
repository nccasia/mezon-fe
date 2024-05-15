import { SmilingFaceIcon } from '@mezon/mobile-components';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export type EmojiPickerOptions = {
	mode?: number;
	togglePopupEmoji?: () => void;
};

function EmojiPicker(props: EmojiPickerOptions) {
	const onPicker = () => {
		props?.togglePopupEmoji();
		// TODO: add logic here
		// 	Emoji, Gif, sticker
	};
	return (
		<TouchableOpacity onPress={onPicker}>
			<SmilingFaceIcon width={25} height={25} />
		</TouchableOpacity>
	);
}

export default EmojiPicker;
