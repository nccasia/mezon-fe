import React from 'react';
import {
	CardStyleInterpolators,
	createStackNavigator,
	TransitionSpecs,
} from '@react-navigation/stack';
import { APP_SCREEN } from "../../ScreenTypes";
import MessageUser from '../../../screens/message/MessageUser';
import { Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import { styles } from './styles';
// eslint-disable-next-line no-empty-pattern
export const MessagesStacks = ({ }: any) => {
	const Stack = createStackNavigator();
	const CustomHeader = ({ title, navigation }) => {

		return (
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<Feather name="arrow-left" size={20} onPress={() => navigation.goBack()} />
					<Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }} >{title}</Text>
				</View>
				<View style={styles.headerRight}>
					<TouchableOpacity style={styles.backgroundIcon}>
						<Feather name="phone-call" size={17} />
					</TouchableOpacity >
					<TouchableOpacity style={styles.backgroundIcon}>
						<Feather name="video" size={17} />
					</TouchableOpacity>

				</View>
			</View>
		);
	};
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
				cardStyle: { backgroundColor: 'white' },
				cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
			}}>
			{/*Example*/}
			<Stack.Screen
				name={APP_SCREEN.MESSAGES.USER}
				component={MessageUser}
				// component={ListIconScreens}
				options={{
					headerShown: true,
					header: (props) => <CustomHeader {...props} title="Messages" />,
				}}
			/>
		</Stack.Navigator>
	);
};
