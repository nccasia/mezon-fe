import { CloseIcon, LogoutIcon } from '@mezon/mobile-components';
import { authActions, useAppDispatch } from '@mezon/store-mobile';
import { Colors } from '@mezon/mobile-ui';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MezonButton } from 'apps/mobile/src/app/temp-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import { styles } from './styles';

export const Setting = React.memo(() => {
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

	const confirmRemoveAccount = () => {
		Alert.alert(
			t('removeAccount'),
			'Are you sure you want to remove account?',
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

	return (
		<View style={styles.settingContainer}>
			<MezonButton onPress={() => confirmRemoveAccount()} viewContainerStyle={styles.logoutButton}>
				<View style={styles.logoutIconWrapper}>
					<CloseIcon width={20} height={20} color={Colors.tertiary} />
				</View>
				<Text style={styles.title}>{t('removeAccount')}</Text>
			</MezonButton>
			<MezonButton onPress={() => confirmLogout()} viewContainerStyle={styles.logoutButton}>
				<View style={styles.logoutIconWrapper}>
					<LogoutIcon color={Colors.textRed} />
				</View>
				<Text style={styles.logoutText}>{t('logOut')}</Text>
			</MezonButton>
		</View>
	);
});
