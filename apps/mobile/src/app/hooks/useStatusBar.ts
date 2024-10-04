import { useFocusEffect } from '@react-navigation/core';
import { StatusBar } from 'react-native';
import { isAndroid } from '../utils/helpers';

export const useStatusBar = (style: 'light-content' | 'dark-content', hidden: boolean) => {
	useFocusEffect(() => {
		if (!isAndroid) {
			StatusBar.setHidden(hidden);
			StatusBar.setBarStyle(style);
		}
	});
};
