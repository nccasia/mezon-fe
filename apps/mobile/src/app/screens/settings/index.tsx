import { LogoutIcon, NittroIcon } from '@mezon/mobile-components';
import { authActions, channelsActions, clansActions, messagesActions, useAppDispatch } from '@mezon/store-mobile';
import { Colors } from '@mezon/mobile-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';
import { styles } from './styles';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import MezonSearch from '../../temp-ui/MezonSearch';
import { reserve, MezonMenu, IMezonMenuItemProps, IMezonMenuSectionProps } from '../../temp-ui';
import MezonMenuItem from '../../temp-ui/MezonMenuItem';

export const Settings = ({ navigation }: { navigation: any }) => {
	const { t } = useTranslation(['setting']);

	const dispatch = useAppDispatch();
	const logout = () => {
		dispatch(authActions.logOut());
		dispatch(channelsActions.removeAll());
		dispatch(messagesActions.removeAll());
		dispatch(clansActions.removeAll());
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

	const navigateToLanguageSetting = () => {
		navigation.navigate(APP_SCREEN.SETTINGS.STACK, { screen: APP_SCREEN.SETTINGS.LANGUAGE });
	}

	const AccountMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.getNitro'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.account'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.privacySafety'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.familyCenter'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.authorizedApp'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.device'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.connection'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.clip'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.friendRequests'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('accountSettings.QRScan'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const PaymentMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('paymentSettings.serverBoots'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('paymentSettings.nitroGift'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('paymentSettings.restoreSubscription'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const AppMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.voice'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.appearance'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.accessibility'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => navigateToLanguageSetting(),
			title: t('appSettings.language'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.chat'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.webBrowser'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.notifications'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.appIcon'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('appSettings.advance'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const SupportMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('supportSettings.support'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('supportSettings.uploadLog'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('supportSettings.acknowledgement'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const WhatsNew: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			expandable: true,
			title: t('whatsNew.whatsNew'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

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
	]

	return (
		<ScrollView contentContainerStyle={styles.settingContainer}>
			<MezonSearch />

			<MezonMenu menu={menu} />

			<MezonMenuItem
				isLast
				onPress={() => confirmLogout()}
				title={t('logOut')}
				icon={<LogoutIcon width={20} height={20} color={Colors.textRed} />}
			/>
		</ScrollView>
	);
};

