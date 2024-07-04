import { Icons, getChannelById } from "@mezon/mobile-components";
import { useTheme } from "@mezon/mobile-ui";
import { ChannelsEntity, selectChannelsEntities } from "@mezon/store-mobile";
import useStatusMuteChannel, { EActionMute } from "apps/mobile/src/app/hooks/useStatusMuteChannel";
import { APP_SCREEN } from "apps/mobile/src/app/navigation/ScreenTypes";
import { useState } from "react";
import { useEffect } from "react";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { style } from "./styles";
import { ChannelStatusEnum } from "@mezon/utils";
import { ChannelType } from "mezon-js";

interface IHomeDefaultHeaderProps {
    navigation: any;
    currentChannel: ChannelsEntity;
    openBottomSheet: () => void;
    onOpenDrawer: () => void;
}

const HomeDefaultHeader = memo(
    ({
        navigation,
        currentChannel,
        openBottomSheet,
        onOpenDrawer,
    }: IHomeDefaultHeaderProps) => {
        const { themeValue } = useTheme();
        const styles = style(themeValue);
        const navigateMenuThreadDetail = () => {
            navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET });
        };
        const channelsEntities = useSelector(selectChannelsEntities);
        const [channelOfThread, setChannelOfThread] = useState<ChannelsEntity>(null);
        const { statusMute } = useStatusMuteChannel();

        useEffect(() => {
            setChannelOfThread(getChannelById(currentChannel?.parrent_id, channelsEntities));
        }, [currentChannel, channelsEntities]);
        return (
            <View style={styles.homeDefaultHeader}>
                <TouchableOpacity style={{ flex: 1 }} onPress={navigateMenuThreadDetail}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity activeOpacity={0.8} style={styles.iconBar} onPress={onOpenDrawer}>
                            <Icons.ArrowLargeLeftIcon width={20} height={20} color={themeValue.textStrong} />
                        </TouchableOpacity>

                        {!!currentChannel?.channel_label && (
                            <View style={styles.channelContainer}>
                                {!!currentChannel?.channel_label && !!Number(currentChannel?.parrent_id) ? (
                                    <Icons.ThreadPlusIcon width={20} height={20} color={themeValue.textStrong} />
                                ) : currentChannel?.channel_private === ChannelStatusEnum.isPrivate &&
                                    currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT ? (
                                    <Icons.TextLockIcon width={20} height={20} color={themeValue.textStrong} />
                                ) : (
                                    <Icons.TextIcon width={20} height={20} color={themeValue.textStrong} />
                                )}
                                <View>
                                    <View style={styles.threadHeaderBox}>
                                        <Text style={styles.threadHeaderLabel} numberOfLines={1}>{currentChannel?.channel_label}</Text>
                                    </View>
                                    {channelOfThread?.channel_label && (
                                        <Text style={styles.channelHeaderLabel} numberOfLines={1}>{channelOfThread?.channel_label}</Text>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {!!currentChannel?.channel_label && (
                    <TouchableOpacity onPress={() => openBottomSheet()} style={styles.actionGroup}>
                        {/* <SearchIcon width={22} height={22} style={{ marginRight: 20 }} /> */}
                        {statusMute === EActionMute.Mute ? (
                            <Icons.BellSlashIcon width={20} height={20} color={themeValue.textStrong} />
                        ) : (
                            <Icons.BellIcon width={20} height={20} color={themeValue.textStrong} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    },
);

export default HomeDefaultHeader;