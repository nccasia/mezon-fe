import { Fonts, useTheme } from '@mezon/mobile-ui';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import ChannelSetting from '../../../components/ChannelSetting';
import ChannelPinnedMessageSetting from '../../../components/ChannelSetting/ChannelPinMessage';
import SearchMessageChannel from '../../../components/ThreadDetail/SearchMessageChannel';
import { ChannelPermissionSetting } from '../../../screens/channelPermissionSetting';
import { APP_SCREEN } from '../../ScreenTypes';

type StackMenuChannelScreen = typeof APP_SCREEN.MENU_CHANNEL.STACK;
// eslint-disable-next-line no-empty-pattern
export function MenuChannelStacks({}: any) {
	const { themeValue } = useTheme();
	const Stack = createStackNavigator();
	const { t } = useTranslation(['screenStack']);

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				gestureEnabled: true,
				gestureDirection: 'horizontal',
				headerTitleAlign: 'center',
				headerTintColor: themeValue.text,
				headerStyle: {
					backgroundColor: themeValue.secondary
				},
				headerTitleStyle: {
					fontSize: Fonts.size.h6,
					fontWeight: 'bold'
				},
				cardStyle: {
					backgroundColor: 'transparent'
				}
			}}
		>
			<Stack.Screen
				name={APP_SCREEN.MENU_CHANNEL.SETTINGS}
				component={ChannelSetting}
				options={{
					headerTitle: t('menuChannelStack.channelSetting'),
					headerStyle: {
						backgroundColor: themeValue.secondary
					},
					headerTitleStyle: {
						color: themeValue.textStrong
					}
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.MENU_CHANNEL.SEARCH_MESSAGE_CHANNEL}
				component={SearchMessageChannel}
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen name={APP_SCREEN.MENU_CHANNEL.CHANNEL_PERMISSION} component={ChannelPermissionSetting} />
			<Stack.Screen name={APP_SCREEN.MENU_CHANNEL.CHANNEL_PINNED_MESSAGE} component={ChannelPinnedMessageSetting} />
		</Stack.Navigator>
	);
}
