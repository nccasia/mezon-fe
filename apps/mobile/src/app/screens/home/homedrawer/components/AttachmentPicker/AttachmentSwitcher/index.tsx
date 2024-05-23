import { PlusIcon } from '@mezon/mobile-components';
import React, { useEffect, useState } from 'react';
import { Keyboard, TouchableOpacity } from 'react-native';
import { IKeyboardType } from '../../BottomKeyboardPicker';

export type AttachmentPickerProps = {
	mode: IKeyboardType;
	onChange: (mode: IKeyboardType) => void;
};

function AttachmentSwitcher({ mode: _mode, onChange }: AttachmentPickerProps) {
	const [mode, setMode] = useState<IKeyboardType>(_mode);

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
			<PlusIcon width={22} height={22} />
		</TouchableOpacity>
	);
}

export default AttachmentSwitcher;
