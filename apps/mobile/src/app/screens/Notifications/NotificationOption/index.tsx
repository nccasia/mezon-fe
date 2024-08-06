import { Icons } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonMenu, reserve } from '../../../temp-ui';
import MezonToggleButton from '../../../temp-ui/MezonToggleButton';
import { style } from './NotificationOption.styles';
interface INotificationOptionProps {
	selectedTabs: { mention: boolean; individual: boolean };
	onChangeTab: (value: string, isSelected: true) => void;
}
const NotificationOption = memo(({ selectedTabs, onChangeTab }: INotificationOptionProps) => {
	const { t } = useTranslation(['notification']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const handleTabChange = (value, isSelected) => {
		onChangeTab(value, isSelected);
	};
	const Btn = useCallback(
		({ val }: { val: 'individual' | 'mention' }) => (
			<MezonToggleButton
				onChange={(isSelected) => handleTabChange(val, isSelected)}
				height={30}
				width={60}
				toggleOnColor={Colors.white}
				value={selectedTabs[val]}
				toggleBgOffColor={Colors.gray48}
				toggleBgOnColor={Colors.bgButton}
				toggleOffColor={Colors.gray72}
			></MezonToggleButton>
		),
		[],
	);

	const notificationMenu = useMemo(
		() =>
			[
				{
					title: t('tabNotify.forYou'),
					icon: <Icons.AtIcon color={themeValue.textStrong} />,
					component: <Btn val="individual" />,
				},
				{
					title: t('tabNotify.mention'),
					icon: <Icons.BellIcon color={themeValue.textStrong} />,
					component: <Btn val="mention" />,
				},
			] satisfies IMezonMenuItemProps[],
		[],
	);

	const settingMenu = useMemo(
		() =>
			[
				{
					title: t('tabNotify.notificationSettings'),
					icon: <Icons.SettingsIcon color={themeValue.textStrong} />,
					expandable: true,
					onPress: () => reserve(),
				},
			] satisfies IMezonMenuItemProps[],
		[],
	);

	const menu = useMemo(
		() => [{ items: notificationMenu }, { items: settingMenu }] satisfies IMezonMenuSectionProps[],
		[notificationMenu, settingMenu],
	);

	return (
		<View style={styles.wrapperOption}>
			<MezonMenu menu={menu} />
		</View>
	);
});

export default NotificationOption;
