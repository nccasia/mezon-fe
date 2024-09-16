import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

type ConfigAnimated = {
	duration: number;
	type: keyof typeof LayoutAnimation.Types;
	creationProp: keyof typeof LayoutAnimation.Properties;
};
if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}
export function useAnimatedState<T>(
	initialValue: T,
	config: ConfigAnimated = {
		duration: 200,
		creationProp: 'opacity',
		type: 'easeInEaseOut'
	}
): [T, Dispatch<SetStateAction<T>>] {
	const [value, setValue] = useState<T>(initialValue);

	const onSetState = useCallback(
		(newValue: T | ((prevState: T) => T)) => {
			LayoutAnimation.configureNext(
				LayoutAnimation.create(config.duration, LayoutAnimation.Types[config.type], LayoutAnimation.Properties[config.creationProp])
			);
			setValue(newValue);
		},
		[config]
	);

	return [value, onSetState];
}
