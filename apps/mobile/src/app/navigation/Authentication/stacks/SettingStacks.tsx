import { createStackNavigator } from "@react-navigation/stack";
import { APP_SCREEN } from "../../ScreenTypes";
import { Colors } from "@mezon/mobile-ui";
import { Setting } from "../../../screens/profile/components";
import { useTranslation } from "react-i18next";

export const SettingStacks = ({ }: any) => {
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
            }}>

            <Stack.Screen
                name={APP_SCREEN.PROFILE.SETTING}
                component={Setting}
                options={{
                    headerTitle: t('headerTitle.settings'),
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
