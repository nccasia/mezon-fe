import { size, useTheme } from "@mezon/mobile-ui";
import { View } from "react-native";
import MuteChannelOption from "../MuteChannelOption";
import NotificationSetting from "../NotificationSetting";

export default function ChannelNotificationSettings() {
    const { themeValue } = useTheme();
    // const styles = style(themeValue);

    return (
        <View style={{ padding: size.s_20, flex: 1, backgroundColor: themeValue.primary }}>
            <MuteChannelOption showOptionsInBS />

            <NotificationSetting />
        </View>
    );
}