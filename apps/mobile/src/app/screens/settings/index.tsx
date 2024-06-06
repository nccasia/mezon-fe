import { LogoutIcon, NittroIcon } from '@mezon/mobile-components';
import { authActions, useAppDispatch } from '@mezon/store-mobile';
import { Colors } from '@mezon/mobile-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, View } from 'react-native';
import { styles } from './styles';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import MezonSearch from '../../temp-ui/MezonSearch';
import SettingBtn from './components/btn/btn';
import Toast from 'react-native-toast-message';

export const Settings = ({ navigation }: { navigation: any }) => {
	const { t } = useTranslation(['setting']);

	const dispatch = useAppDispatch();
	const logout = () => {
		dispatch(authActions.logOut());
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

	const reserve = () => {
		Toast.show({
			type: 'info',
			text1: 'Coming soon'
		});

	}

	const AccountMenu = [
		{
			action: () => reserve(),
			title: t('accountSettings.getNitro'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.account'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.privacySafety'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.familyCenter'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.authorizedApp'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.device'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.connection'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.clip'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.friendRequests'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('accountSettings.QRScan'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const PaymentMenu = [
		{
			action: () => reserve(),
			title: t('paymentSettings.serverBoots'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('paymentSettings.nitroGift'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('paymentSettings.restoreSubscription'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const AppMenu = [
		{
			action: () => reserve(),
			title: t('appSettings.voice'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('appSettings.appearance'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('appSettings.accessibility'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => navigateToLanguageSetting(),
			title: t('appSettings.language'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('appSettings.chat'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('appSettings.webBrowser'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('appSettings.notifications'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('appSettings.appIcon'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('appSettings.advance'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const SupportMenu = [
		{
			action: () => reserve(),
			title: t('supportSettings.support'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('supportSettings.uploadLog'),
			icon: <NittroIcon width={20} height={20} />,
		},
		{
			action: () => reserve(),
			title: t('supportSettings.acknowledgement'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const WhatsNew = [
		{
			action: () => reserve(),
			title: t('whatsNew.whatsNew'),
			icon: <NittroIcon width={20} height={20} />,
		},
	]

	const menu = [
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

			{menu.map((item, index) => (
				<View
					key={index.toString()}
					style={styles.sectionWrapper}>
					<Text style={styles.sectionTitle}>{item.title}</Text>
					<View style={styles.section}>
						{item.items.map((_item, index) => (
							<SettingBtn
								isLast={index === item.items.length - 1}
								key={index.toString()}
								onPress={_item.action}
								title={_item.title}
								icon={_item.icon}
							/>
						))}
					</View>
				</View>
			))}

			<SettingBtn
				isLast
				onPress={() => confirmLogout()}
				title={t('logOut')}
				icon={<LogoutIcon width={20} height={20} color={Colors.textRed} />}
			/>
		</ScrollView>
	);
};

