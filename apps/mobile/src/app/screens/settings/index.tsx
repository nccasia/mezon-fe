import {
	Icons,
	remove,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	STORAGE_KEY_TEMPORARY_ATTACHMENT,
	STORAGE_KEY_TEMPORARY_INPUT_MESSAGES,
} from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { authActions, channelsActions, clansActions, getStoreAsync, messagesActions } from '@mezon/store-mobile';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonMenu, reserve } from '../../temp-ui';
import MezonMenuItem from '../../temp-ui/MezonMenuItem';
import MezonSearch from '../../temp-ui/MezonSearch';
import { style } from './styles';

export const Settings = ({ navigation }: { navigation: any }) => {
	const { t, i18n } = useTranslation(['setting']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const logout = async () => {
		const store = await getStoreAsync();
		store.dispatch(channelsActions.removeAll());
		store.dispatch(messagesActions.removeAll());
		store.dispatch(clansActions.setCurrentClanId(''));
		store.dispatch(clansActions.removeAll());
		await remove(STORAGE_DATA_CLAN_CHANNEL_CACHE);
		await remove(STORAGE_CHANNEL_CURRENT_CACHE);
		await remove(STORAGE_KEY_TEMPORARY_INPUT_MESSAGES);
		await remove(STORAGE_KEY_TEMPORARY_ATTACHMENT);
		store.dispatch(authActions.logOut());
	};

	const confirmLogout = () => {
		Alert.alert(
			t('logOut'),
			'Are you sure you want to log out?',
			[
				{
					text: 'Cancel',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel',
				},
				{ text: 'Yes', onPress: () => logout() },
			],
			{ cancelable: false },
		);
	};

	const AccountMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.getNitro'),
			icon: <Icons.NitroWheelIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => {
				navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
					screen: APP_SCREEN.SETTINGS.ACCOUNT,
				});
			},
			expandable: true,
			title: t('accountSettings.account'),
			icon: <Icons.UserCircleIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.privacySafety'),
			icon: <Icons.ShieldIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.familyCenter'),
			icon: <Icons.GroupIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.authorizedApp'),
			icon: <Icons.KeyIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.device'),
			icon: <Icons.LaptopPhoneIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.connection'),
			icon: <Icons.PuzzlePieceIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.clip'),
			icon: <Icons.ClipIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.friendRequests'),
			icon: <Icons.FriendIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.QRScan'),
			icon: <Icons.QRCodeCameraIcon color={themeValue.textStrong} />,
		},
	];

	const PaymentMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('paymentSettings.serverBoost'),
			icon: <Icons.BoostTier2Icon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('paymentSettings.nitroGift'),
			icon: <Icons.GiftIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('paymentSettings.restoreSubscription'),
			icon: <Icons.NitroWheelIcon color={themeValue.textStrong} />,
		},
	];

	const AppMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.voice'),
			icon: <Icons.MicrophoneIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => {
				navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
					screen: APP_SCREEN.SETTINGS.APPEARANCE,
				});
			},
			expandable: true,
			title: t('appSettings.appearance'),
			icon: <Icons.PaintPaletteIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.accessibility'),
			icon: <Icons.AccessibilityIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => {
				navigation.navigate(APP_SCREEN.SETTINGS.STACK, {
					screen: APP_SCREEN.SETTINGS.LANGUAGE,
				});
			},
			title: t('appSettings.language'),
			expandable: true,
			previewValue: i18n.language,
			icon: <Icons.LanguageIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.chat'),
			icon: <Icons.ImageTextIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.webBrowser'),
			icon: <Icons.GlobeEarthIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.notifications'),
			icon: <Icons.BellIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.appIcon'),
			icon: <Icons.BrandDiscordIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.advanced'),
			icon: <Icons.SettingsIcon color={themeValue.textStrong} />,
		},
	];

	const SupportMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('supportSettings.support'),
			icon: <Icons.CircleQuestionIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('supportSettings.uploadLog'),
			icon: <Icons.CircleInformationIcon color={themeValue.textStrong} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('supportSettings.acknowledgement'),
			icon: <Icons.CircleInformationIcon color={themeValue.textStrong} />,
		},
	];

	const WhatsNew: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('whatsNew.whatsNew'),
			icon: <Icons.CircleInformationIcon color={themeValue.textStrong} />,
		},
	];

	const menu: IMezonMenuSectionProps[] = [
		{
			title: t('accountSettings.title'),
			items: AccountMenu,
		},
		{
			title: t('paymentSettings.title'),
			items: PaymentMenu,
		},
		{
			title: t('appSettings.title'),
			items: AppMenu,
		},
		{
			title: t('supportSettings.title'),
			items: SupportMenu,
		},
		{
			title: t('whatsNew.title'),
			items: WhatsNew,
		},
	];

	return (
		<ScrollView contentContainerStyle={styles.settingContainer}>
			<MezonSearch />

			<MezonMenu menu={menu} />

			<MezonMenuItem
				isLast
				onPress={() => confirmLogout()}
				title={t('logOut')}
				textStyle={{ color: baseColor.red }}
				icon={<Icons.DoorExitIcon color={baseColor.red} />}
			/>
		</ScrollView>
	);
};
