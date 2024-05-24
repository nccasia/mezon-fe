import React from 'react';
import {
	createStackNavigator,
} from '@react-navigation/stack';

import { APP_SCREEN } from "../../ScreenTypes";
import { Colors } from '@mezon/mobile-ui';
import { AddFriend } from '../../../screens/friend/Addfriend';
import { FriendScreen } from '../../../screens/friend';

// eslint-disable-next-line no-empty-pattern
export const FriendStacks = ({ }: any) => {
	const Stack = createStackNavigator();
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				gestureEnabled: true,
				gestureDirection: 'horizontal'
			}}>
			<Stack.Screen
                name={APP_SCREEN.FRIENDS.HOME}
                component={FriendScreen}
                options={{
                    headerTitle: 'Friends',
                    headerTitleAlign: "center",
                    headerTintColor: Colors.white,
                    headerStyle: {
                        backgroundColor: Colors.primary
                    }
                }}
            />
			<Stack.Screen
                name={APP_SCREEN.FRIENDS.ADD_FRIEND}
                component={AddFriend}
                options={{
                    headerTitle: 'add friend',
                    headerTitleAlign: "center",
                    headerTintColor: Colors.white,
                    headerStyle: {
                        backgroundColor: Colors.primary
                    }
                }}
            />
		</Stack.Navigator>
	);
};
