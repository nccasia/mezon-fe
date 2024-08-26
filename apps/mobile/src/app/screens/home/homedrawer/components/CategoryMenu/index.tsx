import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useUserPermission } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { selectCurrentClan } from '@mezon/store-mobile';
import { ICategoryChannel } from '@mezon/utils';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import React, { MutableRefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { APP_SCREEN, AppStackScreenProps } from '../../../../../../app/navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonClanAvatar, MezonMenu, reserve } from '../../../../../../app/temp-ui';
import { style } from './styles';

interface ICategoryMenuProps {
	inviteRef: MutableRefObject<any>;
	category: ICategoryChannel;
}

type StackMenuClanScreen = typeof APP_SCREEN.MENU_CLAN.STACK;
export default function CategoryMenu({ category, inviteRef }: ICategoryMenuProps) {
	const { t } = useTranslation(['categoryMenu']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { dismiss } = useBottomSheetModal();
	const currentClan = useSelector(selectCurrentClan);
	const { isCanManageChannel } = useUserPermission();

	const navigation = useNavigation<AppStackScreenProps<StackMenuClanScreen>['navigation']>();

	const watchMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.watchMenu.markAsRead'),
			onPress: () => reserve(),
			icon: <Icons.EyeIcon color={themeValue.textStrong} />,
		},
	];

	const inviteMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.inviteMenu.invite'),
			onPress: () => {
				inviteRef?.current?.present?.();
				dismiss();
			},
			icon: <Icons.GroupPlusIcon color={themeValue.textStrong} />,
		},
	];

	const notificationMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.notification.muteCategory'),
			onPress: () => reserve(),
			icon: <Icons.BellSlashIcon color={themeValue.textStrong} />,
		},
		{
			title: t('menu.notification.notification'),
			onPress: () => reserve(),
			icon: <Icons.ChannelNotificationIcon color={themeValue.textStrong} />,
		},
	];

	const organizationMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.organizationMenu.edit'),
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, {
					screen: APP_SCREEN.MENU_CLAN.CATEGORY_SETTING,
					params: {
						categoryId: category?.category_id,
					},
				});
			},
			icon: <Icons.SettingsIcon color={themeValue.textStrong} />,
			isShow: isCanManageChannel
		},
		{
			title: t('menu.organizationMenu.createChannel'),
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, {
					screen: APP_SCREEN.MENU_CLAN.CREATE_CHANNEL,
					params: {
						categoryId: category?.category_id,
					},
				});
			},
			icon: <Icons.PlusLargeIcon color={themeValue.textStrong} />,
			isShow: isCanManageChannel
		},
	];

	const devMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.devMode.copyServerID'),
			icon: <Icons.IDIcon color={themeValue.textStrong} />,
			onPress: () => {
				Clipboard.setString(category?.category_id);
				Toast.show({
					type: 'info',
					text1: t('notify.serverIDCopied'),
				});
			},
		},
	];

	const menu: IMezonMenuSectionProps[] = [
		{
			items: watchMenu,
		},
		{
			items: inviteMenu,
		},
		{
			items: notificationMenu,
		},
		{
			items: organizationMenu,
		},
		{
			items: devMenu,
		},
	];

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.avatarWrapper}>
					<MezonClanAvatar
						defaultColor={baseColor.blurple}
						alt={currentClan?.clan_name}
						image={currentClan?.logo}
					/>
				</View>
				<Text style={styles.serverName}>{category?.category_name}</Text>
			</View>

			<View>
				<MezonMenu menu={menu} />
			</View>
		</View>
	);
}
