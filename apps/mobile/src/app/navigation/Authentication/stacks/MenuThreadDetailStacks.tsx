import { CardStyleInterpolators, TransitionSpecs, createStackNavigator } from "@react-navigation/stack";
import { APP_SCREEN } from "../../ScreenTypes";
import { Text } from "react-native";
import { useSelector } from "react-redux";
import { selectCurrentChannel } from "libs/store/src/lib/channels/channels.slice";
import CreateThreadModal from "../../../components/ThreadDetail";
import ThreadAddButton from "../../../components/ThreadDetail/ThreadAddButton";
import CreateThreadForm from "../../../components/ThreadDetail/CreateThreadForm";
import MenuThreadDetail from "../../../components/ThreadDetail/MenuThreadDetail";
import { Colors, size } from "@mezon/mobile-ui";
import { SearchIcon } from "@mezon/mobile-components";
import { useReference } from "@mezon/core";

export const MenuThreadDetailStacks = ({ }: any) => {
	const Stack = createStackNavigator();
  const { openThreadMessageState } = useReference();
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
					headerTintColor: Colors.white,
					headerRight: () => (
						<ThreadAddButton />
					),
				}}
			/>
			<Stack.Screen
				name={APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL}
				component={CreateThreadForm}
				options={{
					headerShown: true,
					headerTitle: () => <Text style={{ color: Colors.white, fontSize: size.h5 }}>{openThreadMessageState ? 'New Thread' : currentChannel?.channel_label}</Text>,
					headerTitleStyle: {
						color: Colors.white,
					},
					headerStyle: {
						backgroundColor: Colors.secondary,
					},
					headerTintColor: Colors.white,
					headerRight: () => (
						<SearchIcon width={22} height={22} />
					),
				}}
			/>
		</Stack.Navigator>
	);
}

