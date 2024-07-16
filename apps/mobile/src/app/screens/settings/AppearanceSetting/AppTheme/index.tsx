import { ThemeMode, ThemeModeAuto, ThemeModeBase, themeColors, useTheme } from '@mezon/mobile-ui';
import { APP_SCREEN, SettingScreenProps } from 'apps/mobile/src/app/navigation/ScreenTypes';
import { IMezonSlideOptionsData, MezonSlideOption } from 'apps/mobile/src/app/temp-ui';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Appearance, View } from 'react-native';
import { style } from './styles';

type AppThemeScreen = typeof APP_SCREEN.SETTINGS.APP_THEME;
export default function AppThemeSetting({ navigation }: SettingScreenProps<AppThemeScreen>) {
	const systemTheme = Appearance.getColorScheme();
	const { themeValue, setTheme, theme } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['appThemeSetting']);

	const BoxSelector = useCallback(
		({ color = 'transparent', border = 'transparent' }: { color?: string; border?: string }) => (
			<View style={[styles.box, { backgroundColor: color, borderColor: border }]}></View>
		),
		[],
	);

	const themeOptions = useMemo(
		() =>
			[
				{
					element: <BoxSelector color={themeColors.dark.primary} border={themeColors.dark.border} />,
					value: ThemeModeBase.DARK,
					title: t('fields.dark'),
				},
				{
					element: <BoxSelector color={themeColors.light.primary} border={themeColors.light.border} />,
					value: ThemeModeBase.LIGHT,
					title: t('fields.light'),
				},
				{
					element: (
						<BoxSelector
							color={systemTheme == 'light' ? themeColors.light.primary : themeColors.dark.primary}
							border={systemTheme == 'light' ? themeColors.light.border : themeColors.dark.border}
						/>
					),
					value: ThemeModeAuto.AUTO,
					title: t('fields.system'),
				},
			] satisfies IMezonSlideOptionsData[],
		[],
	);

	function handleThemeChange(value: string) {
		setTheme(value as ThemeMode);
	}

	return (
		<View style={styles.container}>
			<MezonSlideOption data={themeOptions} onChange={handleThemeChange} initialIndex={themeOptions.findIndex((t) => t.value === theme)} />
		</View>
	);
}
