import { Icons } from '@mezon/mobile-components';
import React, { useEffect, useState } from 'react';
import { Keyboard, TouchableOpacity } from 'react-native';
import { IModeKeyboardPicker } from '../../BottomKeyboardPicker';
import { useTheme } from '@mezon/mobile-ui';

export type AttachmentPickerProps = {
	mode: IModeKeyboardPicker;
	onChange: (mode: IModeKeyboardPicker) => void;
};

function AttachmentSwitcher({ mode: _mode, onChange }: AttachmentPickerProps) {
	const { themeValue } = useTheme();
	const [mode, setMode] = useState<IModeKeyboardPicker>(_mode);

	const onPickerPress = () => {
		if (mode === 'text') {
			Keyboard.dismiss();
			onChange && onChange('attachment');
			setMode('attachment');
		} else {
			setMode('text');
			onChange && onChange('text');
		}
	};

	useEffect(() => {
		setMode(_mode);
	}, [_mode]);

	return (
		<TouchableOpacity onPress={onPickerPress}>
			<Icons.PlusLargeIcon width={22} height={22} color={themeValue.textStrong} />
		</TouchableOpacity>
	);
}

export default AttachmentSwitcher;
