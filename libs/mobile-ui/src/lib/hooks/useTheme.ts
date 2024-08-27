import { selectTheme } from '@mezon/store';
import { appActions, useAppDispatch } from '@mezon/store-mobile';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { useSelector } from 'react-redux';
import { themeColors } from '../themes/Constants';
export enum ThemeModeBase {
	LIGHT = 'light',
	DARK = 'dark'
	// DARKER = "darker",
	// MIDNIGHT = "midnight",
}

export enum ThemeModeAuto {
	AUTO = 'system'
}

export type ThemeMode = ThemeModeBase | ThemeModeAuto;

export function useTheme(themeMode?: ThemeMode) {
	const systemTheme = Appearance.getColorScheme() == 'dark' ? ThemeModeBase.DARK : ThemeModeBase.LIGHT;
	const dispatch = useAppDispatch();
	const appearanceTheme = useSelector(selectTheme);

	const setAppearanceTheme = useCallback(
		(value: ThemeMode) => {
			dispatch(appActions.setTheme(value));
		},
		[dispatch]
	);

	// @ts-ignore
	const [theme, setTheme] = useState<ThemeMode>(themeMode ? themeMode : appearanceTheme);

	useEffect(() => {
		// @ts-ignore
		setTheme(themeMode ? themeMode : appearanceTheme);
	}, [appearanceTheme, themeMode]);

	return useMemo(() => {
		const themeBasicMode = themeMode
			? themeMode == ThemeModeAuto.AUTO
				? systemTheme
				: themeMode
			: appearanceTheme == 'system'
				? systemTheme
				: appearanceTheme;

		return {
			themeValue: themeColors[themeBasicMode],
			themeBasic: themeBasicMode,
			theme: theme,
			setTheme: setAppearanceTheme
		};
	}, [setAppearanceTheme, theme]);
}
