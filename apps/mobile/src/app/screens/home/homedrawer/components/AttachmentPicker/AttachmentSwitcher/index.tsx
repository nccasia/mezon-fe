import { Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, TouchableOpacity } from 'react-native';
import { IModeKeyboardPicker } from '../../BottomKeyboardPicker';

export type AttachmentPickerProps = {
	mode: IModeKeyboardPicker;
	onChange: (mode: IModeKeyboardPicker) => void;
};

function AttachmentSwitcher({ mode: _mode, onChange }: AttachmentPickerProps) {
	const { themeValue } = useTheme();
	const rotation = useRef(new Animated.Value(0)).current; // 0 is initial value for rotation
	const [mode, setMode] = useState<IModeKeyboardPicker>(_mode);
	const onPickerPress = () => {
		if (mode !== 'attachment') {
			Keyboard.dismiss();
			onChange && onChange('attachment');
			Animated.spring(rotation, {
				toValue: 1, // Animate to 45deg
				useNativeDriver: true
			}).start();
		} else {
			setMode('text');
			onChange && onChange('text');
			Animated.spring(rotation, {
				toValue: 0, // Animate back to 0deg
				useNativeDriver: true
			}).start();
		}
	};

	useEffect(() => {
		setMode(_mode);
		if (_mode === 'attachment') {
			Animated.spring(rotation, {
				toValue: 1, // Animate to 45deg
				useNativeDriver: true
			}).start();
		} else {
			Animated.spring(rotation, {
				toValue: 0, // Animate back to 0deg
				useNativeDriver: true
			}).start();
		}
	}, [_mode]);

	const rotate = rotation.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '45deg']
	});

	return (
		<Animated.View style={{ transform: [{ rotate }] }}>
			<TouchableOpacity
				activeOpacity={0}
				onPress={onPickerPress}
				style={{
					width: size.s_40,
					height: size.s_40,
					borderRadius: size.s_40,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: themeValue.tertiary
				}}
			>
				<Icons.PlusLargeIcon width={size.s_24} height={size.s_24} color={mode === 'attachment' ? themeValue.bgViolet : themeValue.textStrong} />
			</TouchableOpacity>
		</Animated.View>
	);
}

export default AttachmentSwitcher;
