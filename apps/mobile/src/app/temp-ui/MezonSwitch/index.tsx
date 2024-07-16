import { Icons } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import React, { ReactNode, useEffect, useState } from 'react';
import { SwitchProps, TouchableOpacity, View } from 'react-native';
import { style } from './styles';

interface IMezonSwitch extends SwitchProps {
	iconOn?: ReactNode,
	iconOff?: ReactNode,
	iconYesNo?: boolean
}

export const MezonSwitch = ({ value, onValueChange, iconYesNo, iconOn, iconOff }: IMezonSwitch) => {
	const [isEnabled, setIsEnabled] = useState(value);
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	useEffect(() => {
		if (value !== isEnabled) setIsEnabled(value);
	}, [value]);

	const toggleSwitch = () => {
		onValueChange && onValueChange(!isEnabled);
		setIsEnabled((previousState) => !previousState);
	};

	return (
		<TouchableOpacity style={[styles.switchContainer, isEnabled ? styles.switchContainerEnabled : {}]} onPress={toggleSwitch}>
			<View style={[styles.circle, isEnabled ? styles.circleEnabled : {}]}>
				{iconYesNo
					? isEnabled
						? <Icons.CheckmarkSmallIcon color={baseColor.blurple} height={22} width={22} />
						: <Icons.CloseSmallIcon color={themeValue.secondary} height={20} width={20} />
					: isEnabled
						? iconOn
						: iconOff
				}
			</View>
		</TouchableOpacity>
	);
};
