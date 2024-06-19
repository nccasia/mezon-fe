import { Colors } from '@mezon/mobile-ui';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../screens/settings';
import { LanguageSetting } from '../../../screens/settings/LanguageSetting';
import { ProfileSetting } from '../../../screens/settings/ProfileSetting';
import { Sharing } from '../../../screens/settings/Sharing';
import { APP_SCREEN } from '../../ScreenTypes';

export const SettingStacks = ({}: any) => {
	const Stack = createStackNavigator();
	const { t } = useTranslation(['screen']);
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				gestureEnabled: true,
				gestureDirection: 'horizontal',
				headerBackTitleVisible: false,
			}}
		>
			<Stack.Screen
				name={APP_SCREEN.SETTINGS.HOME}
				component={Settings}
				options={{
					headerTitle: t('headerTitle.settings'),
					headerTitleAlign: 'center',
					headerTintColor: Colors.white,
					headerStyle: {
						backgroundColor: Colors.secondary,
					},
				}}
			/>

			<Stack.Screen
				name={APP_SCREEN.SETTINGS.LANGUAGE}
				component={LanguageSetting}
				options={{
					headerTitle: t('headerTitle.language'),
					headerTitleAlign: 'center',
					headerTintColor: Colors.white,
					headerStyle: {
						backgroundColor: Colors.secondary,
					},
				}}
			/>

			<Stack.Screen
				name={APP_SCREEN.SETTINGS.PROFILE}
				component={ProfileSetting}
				options={{
					headerTitle: t('headerTitle.profile'),
					headerTitleAlign: 'center',
					headerTintColor: Colors.white,
					headerStyle: {
						backgroundColor: Colors.secondary,
					},
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.SETTINGS.SHARING}
				component={Sharing}
				options={{
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	);
};
