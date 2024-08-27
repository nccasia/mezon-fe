import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Icons } from "@mezon/mobile-components";
import { size, useTheme } from "@mezon/mobile-ui";
import { notificationSettingActions, selectCurrentChannel, selectCurrentChannelNotificatonSelected, selectCurrentClanId, useAppDispatch } from "@mezon/store";
import { useNavigation } from "@react-navigation/native";
import { ChannelType } from "mezon-js";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { IMezonMenuSectionProps, MezonBottomSheet, MezonMenu } from "../../../temp-ui";

enum ENotificationActive {
    ON = 1,
    OFF = 0
}

interface IMuteChannelOption {
    showOptionsInBS?: boolean;
    navigateBack?: boolean;
}

export default function MuteChannelOption({ showOptionsInBS, navigateBack }: IMuteChannelOption) {
    const { themeValue } = useTheme();
    // const styles = style(themeValue);
    const getNotificationChannelSelected = useSelector(selectCurrentChannelNotificatonSelected);
    const currentChannel = useSelector(selectCurrentChannel);
    const currentClanId = useSelector(selectCurrentClanId);
    const dispatch = useAppDispatch();
    const { t } = useTranslation(['notificationSetting']);
    const navigation = useNavigation<any>();

    navigation.setOptions({
        headerShown: true,
        title: "Notifications"
    });

    const optionBSRef = useRef<BottomSheetModal>();

    const navigateToNotificationDetail = () => {
        navigation.goBack();
    };

    const handleScheduleMute = (duration: number) => {
        if (duration !== Infinity) {
            const now = new Date();
            const unmuteTime = new Date(now.getTime() + duration);
            const unmuteTimeISO = unmuteTime.toISOString();

            const body = {
                channel_id: currentChannel?.id || '',
                notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
                clan_id: currentClanId || '',
                time_mute: unmuteTimeISO,
            };
            dispatch(notificationSettingActions.setNotificationSetting(body));
        } else {
            const body = {
                channel_id: currentChannel?.id || '',
                notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
                clan_id: currentClanId || '',
                active: ENotificationActive.OFF,
            };
            dispatch(notificationSettingActions.setMuteNotificationSetting(body));
        }

        if (navigateBack) {
            navigateToNotificationDetail()
        } else {
            optionBSRef.current?.dismiss();
        }
    };

    const changeUnMuteChannel = (active: ENotificationActive) => {
        const body = {
            channel_id: currentChannel?.channel_id || '',
            notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
            clan_id: currentClanId || '',
            active,
        };
        dispatch(notificationSettingActions.setMuteNotificationSetting(body));
        navigateBack && navigateToNotificationDetail();
    };

    const openOptionBS = () => {
        optionBSRef?.current?.present();
    }

    const isDMThread = useMemo(() => {
        return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
    }, [currentChannel]);

    const isChannel = useMemo(() => {
        return currentChannel?.parrent_id !== "0";
    }, [currentChannel]);

    const channelName = useMemo(() => {
        return isDMThread
            ? currentChannel?.channel_label
            : isChannel
                ? `#${currentChannel?.channel_label}`
                : `"${currentChannel?.channel_label}"`;
    }, [isChannel, isDMThread]);

    const canMute = useMemo(() => {
        return getNotificationChannelSelected?.active === ENotificationActive.ON ||
            getNotificationChannelSelected.id == "0";
    }, [getNotificationChannelSelected?.active, getNotificationChannelSelected?.id])

    const menu = useMemo(
        () => ({
            items: [
                {
                    title: t('notifySettingThreadModal.muteDuration.forFifteenMinutes'),
                    onPress: () => {
                        handleScheduleMute(15 * 60 * 1000);
                    },
                },
                {
                    title: t('notifySettingThreadModal.muteDuration.forOneHour'),
                    onPress: () => {
                        handleScheduleMute(60 * 60 * 1000);
                    },
                },
                {
                    title: t('notifySettingThreadModal.muteDuration.forThreeHours'),
                    onPress: () => {
                        handleScheduleMute(3 * 60 * 60 * 1000);
                    },
                },
                {
                    title: t('notifySettingThreadModal.muteDuration.forEightHours'),
                    onPress: () => {
                        handleScheduleMute(8 * 60 * 60 * 1000);
                    },
                },
                {
                    title: t('notifySettingThreadModal.muteDuration.forTwentyFourHours'),
                    onPress: () => {
                        handleScheduleMute(24 * 60 * 60 * 1000);
                    },
                },
                {
                    title: t('notifySettingThreadModal.muteDuration.untilTurnItBackOn'),
                    onPress: () => {
                        handleScheduleMute(Infinity);
                    },
                },
            ]
        }) as IMezonMenuSectionProps,
        [],
    );

    const muteBtn = useMemo(() => ({
        items: [{
            title: `Unmute ${channelName}`,
            onPress: () => changeUnMuteChannel(ENotificationActive.ON),
            icon: <Icons.BellSlashIcon width={20} height={20} style={{ marginRight: 20 }} color={themeValue.text} />,
            isShow: !canMute
        }, {
            title: `Mute ${channelName}`,
            onPress: () => openOptionBS(),
            icon: <Icons.BellIcon width={20} height={20} style={{ marginRight: 20 }} color={themeValue.text} />,
            expandable: true,
            isShow: canMute
        }],
        // TODO: Fix this
        bottomDescription: "You won't receive notifications from muted channels, and they will appear grayed out in your channel list. This settings applies across all your devices."
    }) as IMezonMenuSectionProps, [canMute])

    return (
        <View>
            {canMute ? (
                <MezonMenu menu={[menu]} />
            ) : (
                <MezonMenu menu={[muteBtn]} />
            )}

            {showOptionsInBS &&
                <MezonBottomSheet
                    ref={optionBSRef}
                    heightFitContent
                    innerStyle={{ padding: size.s_20 }}
                    // TODO: Fix this
                    title={"Options"}>
                    <MezonMenu menu={[menu]} />
                </MezonBottomSheet>
            }
        </View>
    )
}