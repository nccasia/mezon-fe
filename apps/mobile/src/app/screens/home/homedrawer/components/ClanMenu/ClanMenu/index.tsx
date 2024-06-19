import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import styles from "./styles";
import { AddFillIcon, BellIcon, KeyframeIcon, SettingIcon } from "@mezon/mobile-components";
import MezonButtonIcon from "apps/mobile/src/app/temp-ui/MezonButtonIcon";
import { reserve, MezonMenu, IMezonMenuSectionProps, IMezonMenuItemProps } from "apps/mobile/src/app/temp-ui";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { ClansEntity } from "@mezon/store-mobile";
import ClanMenuInfo from "../ClanMenuInfo";
import MezonToggleButton from "apps/mobile/src/app/temp-ui/MezonToggleButton";
import { APP_SCREEN, AppStackScreenProps } from "apps/mobile/src/app/navigation/ScreenTypes";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { MutableRefObject } from "react";
import Clipboard from "@react-native-clipboard/clipboard";
import { useAuth, useClans } from "@mezon/core";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";

interface IServerMenuProps {
    clan: ClansEntity;
    inviteRef: MutableRefObject<any>;
}

export default function ClanMenu({ clan, inviteRef }: IServerMenuProps) {
    const { t } = useTranslation(['clanMenu']);
    const user = useAuth();
    const navigation = useNavigation<AppStackScreenProps['navigation']>();
    const { clans } = useClans();
    const { dismiss } = useBottomSheetModal();

    const handleOpenInvite = () => {
        inviteRef?.current.open();
        dismiss();
    }

    const handleOpenSettings = () => {
        navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, { screen: APP_SCREEN.MENU_CLAN.SETTINGS });
        dismiss();
    }

    const ToggleBtn = () => <MezonToggleButton
        onChange={() => { }}
        height={25}
        width={45}
    />

    const watchMenu: IMezonMenuItemProps[] = [
        {
            onPress: () => reserve(),
            title: t('menu.watchMenu.markAsRead'),
        },
        {
            onPress: () => reserve(),
            title: t('menu.watchMenu.browseChannels'),
        },
    ]

    const organizationMenu: IMezonMenuItemProps[] = [
        {
            onPress: () => reserve(),
            title: t('menu.organizationMenu.createChannel'),
        },
        {
            onPress: () => {
                dismiss();
                navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, { screen: APP_SCREEN.MENU_CLAN.CREATE_CATEGORY });
            },
            title: t('menu.organizationMenu.createCategory'),
        },
        {
            onPress: () => reserve(),
            title: t('menu.organizationMenu.createEvent'),
        },
    ]

    const optionsMenu: IMezonMenuItemProps[] = [
        {
            onPress: () => reserve(),
            title: t('menu.optionsMenu.editServerProfile'),
        },
        {
            onPress: () => reserve(),
            title: t('menu.optionsMenu.editServerProfile'),
        },
        {
            title: t('menu.optionsMenu.showAllChannels'),
            component: <ToggleBtn />
        },
        {
            title: t('menu.optionsMenu.hideMutedChannels'),
            component: <ToggleBtn />
        },
        {
            title: t('menu.optionsMenu.allowDirectMessage'),
            component: <ToggleBtn />
        },
        {
            title: t('menu.optionsMenu.allowMessageRequest'),

            component: <ToggleBtn />
        },
        {
            onPress: () => reserve(),
            title: t('menu.optionsMenu.reportServer'),
        },
        {
            onPress: () => reserve(),
            title: t('menu.optionsMenu.leaveServer'),
            textStyle: { color: "red" }
        },
    ]

    const devMenu: IMezonMenuItemProps[] = [
        {
            onPress: () => {
                Clipboard.setString(clan.clan_id);
                Toast.show({
                    type: 'info',
                    text1: t('menu.devMode.serverIDCopied'),
                });
            },
            title: t('menu.devMode.copyServerID'),
        }
    ]

    const menu: IMezonMenuSectionProps[] = [
        {
            items: watchMenu,
        },
        {
            items: organizationMenu,
        },
        {
            items: optionsMenu,
        },
        {
            title: t('menu.devMode.title'),
            items: devMenu,
        },
    ]

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarWrapper}>
                    <FastImage
                        source={{ uri: clan?.logo }}
                        style={{ width: "100%", height: "100%" }}
                    />
                </View>
                <Text style={styles.serverName}>{clan?.clan_name}</Text>
                <ClanMenuInfo clan={clan} />

                <ScrollView
                    contentContainerStyle={styles.actionWrapper}
                    horizontal>
                    <MezonButtonIcon
                        title={`18 ${t("actions.boot")}`}
                        icon={KeyframeIcon}
                        iconStyle={{ color: "red" }}
                        onPress={() => reserve()}
                    />
                    <MezonButtonIcon
                        title={t("actions.invite")}
                        icon={AddFillIcon}
                        onPress={handleOpenInvite} />
                    <MezonButtonIcon
                        title={t("actions.notifications")}
                        icon={BellIcon}
                        onPress={() => reserve()} />

                    {user.userId === clan.creator_id &&
                        <MezonButtonIcon
                            title={t("actions.settings")}
                            icon={SettingIcon}
                            onPress={handleOpenSettings}
                        />
                    }

                </ScrollView>

                <View>
                    <MezonMenu menu={menu} />
                </View>
            </View>
        </View>
    )
}