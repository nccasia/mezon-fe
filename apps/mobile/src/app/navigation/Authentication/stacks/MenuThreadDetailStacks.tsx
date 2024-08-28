import { useReference } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Attributes, Colors, size, useTheme } from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { ChannelStatusEnum } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators, TransitionSpecs, createStackNavigator } from '@react-navigation/stack';
import { ChannelType } from 'mezon-js';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import MuteThreadDetailModal from '../../../components/MuteThreadDetailModal';
import CreateThreadModal from '../../../components/ThreadDetail';
import CreateThreadForm from '../../../components/ThreadDetail/CreateThreadForm';
import MenuThreadDetail from '../../../components/ThreadDetail/MenuThreadDetail';
import ThreadAddButton from '../../../components/ThreadDetail/ThreadAddButton';
import { APP_SCREEN } from '../../ScreenTypes';

export const MenuThreadDetailStacks = ({ }: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const Stack = createStackNavigator();
	const { openThreadMessageState } = useReference();
	const navigation = useNavigation();
  const { t } = useTranslation(['notificationSetting', 'createThread']);
	const currentChannel = useSelector(selectCurrentChannel);
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				headerShadowVisible: false,
				gestureEnabled: true,
				headerLeftLabelVisible: false,
				headerBackTitleVisible: false,
				gestureDirection: 'horizontal',
				headerTintColor: themeValue.text,
				transitionSpec: {
					open: TransitionSpecs.TransitionIOSSpec,
					close: TransitionSpecs.TransitionIOSSpec,
				},
				headerTitleStyle: {
					color: themeValue.textStrong,
				},
				headerStyle: {
					backgroundColor: themeValue.secondary,
				},
				cardStyle: { backgroundColor: "transparent" },
				cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
			}}
		>
			<Stack.Screen
				name={APP_SCREEN.MENU_THREAD.BOTTOM_SHEET}
				component={MenuThreadDetail}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.MENU_THREAD.CREATE_THREAD}
				component={CreateThreadModal}
				options={{
					headerShown: true,
					headerTitle: t('threads', { ns: 'createThread' }),
          headerTitleAlign: 'center',
					headerRight: () => <ThreadAddButton />,
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL}
				component={CreateThreadForm}
				options={{
					headerShown: true,
					headerTitle: () => <Text></Text>,
					headerLeft: () => (
						<View style={styles.headerLeft}>
							<TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
								<Icons.ChevronSmallLeftIcon color={themeValue.textStrong} />
							</TouchableOpacity>
							<View>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									{!openThreadMessageState && (
										<View style={{ marginRight: size.s_10 }}>
											{currentChannel?.channel_private === ChannelStatusEnum.isPrivate &&
												currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT ? (
												<Icons.TextLockIcon width={18} height={18} color={themeValue.textStrong} />
											) : (
												<Icons.TextIcon width={18} height={18} color={themeValue.textStrong} />
											)}
										</View>
									)}
									<Text style={{ color: themeValue.textStrong, fontSize: size.h6, fontWeight: '700' }}>
										{openThreadMessageState ? t('newThread', { ns: 'createThread' }) : currentChannel?.channel_label}
									</Text>
									<Icons.ChevronSmallRightIcon width={14} height={14} style={{ marginLeft: 5 }} color={themeValue.text} />
								</View>
								{openThreadMessageState && (
									<Text
										numberOfLines={1}
										style={{ color: themeValue.text, fontSize: size.medium, fontWeight: '400', maxWidth: '90%' }}
									>
										{currentChannel?.channel_label}
									</Text>
								)}
							</View>
						</View>
					),
					headerTintColor: Colors.white,
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL}
				component={MuteThreadDetailModal}
			/>

		</Stack.Navigator>
	);
};

const style = (colors: Attributes) => StyleSheet.create({
	headerLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	btnBack: {
		paddingLeft: size.s_16,
		paddingRight: size.s_14,
		height: '100%',
		justifyContent: 'center',
	},
});
