import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import React, { useEffect, useState } from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { IModeKeyboardPicker } from '../../BottomKeyboardPicker';

export type IProps = {
	mode: IModeKeyboardPicker;
	onChange: (mode: IModeKeyboardPicker) => void;
};

function EmojiSwitcher({ mode: _mode, onChange }: IProps) {
	const { themeValue } = useTheme();
	const [mode, setMode] = useState<IModeKeyboardPicker>(_mode);

	const onPickerPress = () => {
		if (mode === 'text') {
			Keyboard.dismiss();
			onChange && onChange('emoji');
			setMode('emoji');
		} else {
			setMode('text');
			onChange && onChange('text');
		}
	};

	useEffect(() => {
		setMode(_mode);
	}, [_mode]);

	return (
		<View>
			<TouchableOpacity onPress={onPickerPress}>
				{mode !== 'emoji'
					? <Icons.ReactionIcon width={22} height={22} color={themeValue.text} />
					: <Icons.KeyboardIcon width={22} height={22} color={themeValue.text} />}
			</TouchableOpacity>
		</View>
	);
}

export default EmojiSwitcher;
