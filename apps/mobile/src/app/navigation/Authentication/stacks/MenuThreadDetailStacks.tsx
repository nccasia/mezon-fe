import { useReference } from '@mezon/core';
import { AngleRight, ArrowLeftIcon, HashSignIcon } from '@mezon/mobile-components';
import { Colors, size } from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators, TransitionSpecs, createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import MuteThreadDetailModal from '../../../components/MuteThreadDetailModal';
import CreateThreadModal from '../../../components/ThreadDetail';
import CreateThreadForm from '../../../components/ThreadDetail/CreateThreadForm';
import MenuThreadDetail from '../../../components/ThreadDetail/MenuThreadDetail';
import ThreadAddButton from '../../../components/ThreadDetail/ThreadAddButton';
import { APP_SCREEN } from '../../ScreenTypes';

export const MenuThreadDetailStacks = ({}: any) => {
	const Stack = createStackNavigator();
	const { t } = useTranslation(['notificationSetting']);
	const { openThreadMessageState } = useReference();
	const navigation = useNavigation();
	const currentChannel = useSelector(selectCurrentChannel);
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				headerShadowVisible: false,
				gestureEnabled: true,
				gestureDirection: 'horizontal',
				transitionSpec: {
					open: TransitionSpecs.TransitionIOSSpec,
					close: TransitionSpecs.TransitionIOSSpec,
				},
				cardStyle: { backgroundColor: Colors.secondary },
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
					headerTitle: 'Threads',
					headerTitleStyle: {
						color: Colors.white,
					},
					headerStyle: {
						backgroundColor: Colors.secondary,
					},
					headerLeftLabelVisible: false,
					headerTintColor: Colors.white,
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
								<ArrowLeftIcon />
							</TouchableOpacity>
							<View>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									{!openThreadMessageState && (
										<View style={{ marginRight: size.s_10 }}>
											<HashSignIcon width={18} height={18} />
										</View>
									)}
									<Text style={{ color: Colors.white, fontSize: size.h6 }}>
										{openThreadMessageState ? 'New Thread' : currentChannel?.channel_label}
									</Text>
									<AngleRight width={14} height={14} style={{ marginLeft: size.s_10 }}></AngleRight>
								</View>
								{openThreadMessageState && (
									<Text style={{ color: Colors.textGray, fontSize: size.medium, fontWeight: '400' }}>
										{currentChannel?.channel_label}
									</Text>
								)}
							</View>
						</View>
					),
					headerTitleStyle: {
						color: Colors.white,
					},
					headerStyle: {
						backgroundColor: Colors.secondary,
					},
					headerLeftLabelVisible: false,
					headerTintColor: Colors.white,
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL}
				component={MuteThreadDetailModal}
				options={{
					headerShown: true,
					headerTitle: () => (
						<View>
							<Text style={{ color: Colors.white, fontSize: size.label, fontWeight: '700' }}>
								{t('notifySettingThreadModal.headerTitle')}
							</Text>
							<Text style={{ color: Colors.textGray, fontSize: size.medium, fontWeight: '400' }}>
								"{currentChannel?.channel_label}""
							</Text>
						</View>
					),
					headerTitleStyle: {
						color: Colors.white,
					},
					headerStyle: {
						backgroundColor: Colors.secondary,
					},
					headerTintColor: Colors.white,
					headerLeftLabelVisible: false,
				}}
			/>
		</Stack.Navigator>
	);
};

const styles = StyleSheet.create({
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
