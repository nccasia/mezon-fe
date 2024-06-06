import { createStackNavigator } from "@react-navigation/stack";
import { APP_SCREEN } from "../../ScreenTypes";
import CategoryCreator from "../../../components/Category";
import { Pressable, Text } from "react-native";
import { Colors } from "@mezon/mobile-ui";

export const MenuClanStacks = ({ }: any) => {
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
                name={APP_SCREEN.MENU_CLAN.CREATE_CATEGORY}
                component={CategoryCreator}
                options={{
                    headerTitle: 'Create Category',
                    headerTitleAlign: "center",
                    headerTintColor: Colors.white,
                    headerStyle: {
                        backgroundColor: Colors.primary
                    }
                }}
            />
        </Stack.Navigator>
    );
}

