import { CrossIcon, HashSignLockIcon } from "@mezon/mobile-components";
import { Pressable, ScrollView } from "react-native";
import { APP_SCREEN, MenuClanScreenProps } from "../../navigation/ScreenTypes";
import { reserve, MezonMenu, IMezonMenuSectionProps, IMezonMenuItemProps } from "../../temp-ui";
import styles from "./styles";
import { useTranslation } from "react-i18next";
import LogoClanSelector from "./LogoClanSelector";

type ClanSettingsScreen = typeof APP_SCREEN.MENU_CLAN.SETTINGS;

export default function ClanSetting({ navigation }: MenuClanScreenProps<ClanSettingsScreen>) {
    const { t } = useTranslation(['clanSetting']);

    navigation.setOptions({
        headerLeft: () => (
            <Pressable style={{ padding: 20 }} onPress={handleClose}>
                <CrossIcon height={16} width={16} />
            </Pressable>
        ),
    });

    function handleClose() {
        navigation.goBack();
    }

    const settingsMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.settings.overview'),
            onPress: () => {
                navigation.navigate(APP_SCREEN.MENU_CLAN.OVERVIEW_SETTING)
            },
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.settings.moderation'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.settings.auditLog'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.settings.channels'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.settings.integrations'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.settings.emoji'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.settings.webhooks'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.settings.security'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        }
    ]

    const communityMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.community.enableCommunity'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        }
    ]

    const subscriptionMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.subscriptions.getStarted'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        }
    ]

    const userManagementMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.userManagement.members'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.userManagement.role'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.userManagement.invite'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        },
        {
            title: t('menu.userManagement.bans'),
            onPress: () => reserve(),
            expandable: true,
            icon: <HashSignLockIcon />
        }
    ]

    const menu: IMezonMenuSectionProps[] = [
        {
            title: t('menu.settings.title'),
            items: settingsMenu,
        },
        {
            title: t('menu.community.title'),
            items: communityMenu,
        },
        {
            title: t('menu.subscriptions.title'),
            items: subscriptionMenu,
        },
        {
            title: t('menu.userManagement.title'),
            items: userManagementMenu,
        },
    ]

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <LogoClanSelector />
            <MezonMenu menu={menu} />
        </ScrollView>
    )
}