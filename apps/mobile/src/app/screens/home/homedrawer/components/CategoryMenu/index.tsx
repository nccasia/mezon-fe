import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { ICategoryChannel } from "@mezon/utils";
import { MutableRefObject } from "react";
import { Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import styles from "./styles";
import { useClans } from "@mezon/core";
import { reserve, IMezonMenuSectionProps, MezonMenu, IMezonMenuItemProps } from "apps/mobile/src/app/temp-ui";
import { useTranslation } from "react-i18next";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-toast-message";
import { NittroIcon } from "@mezon/mobile-components";
import { useNavigation } from "@react-navigation/native";
import { APP_SCREEN, AppStackScreenProps } from "apps/mobile/src/app/navigation/ScreenTypes";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";

interface ICategoryMenuProps {
    category: ICategoryChannel;
}

type StackMenuClanScreen = typeof APP_SCREEN.MENU_CLAN.STACK;
export default function CategoryMenu({ category }: ICategoryMenuProps) {
    const { currentClan } = useClans();
    const { dismiss } = useBottomSheetModal();

    const { t } = useTranslation(['categoryMenu']);
    const navigation = useNavigation<AppStackScreenProps<StackMenuClanScreen>['navigation']>()

    const watchMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.watchMenu.markAsRead'),
            onPress: () => reserve(),
            icon: <NittroIcon />
        }
    ]

    const inviteMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.inviteMenu.invite'),
            onPress: () => reserve(),
            icon: <NittroIcon />
        }
    ]

    const notificationMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.notification.muteCategory'),
            onPress: () => reserve(),
            icon: <NittroIcon />
        },
        {
            title: t('menu.notification.notification'),
            onPress: () => reserve(),
            icon: <NittroIcon />
        }
    ]

    const organizationMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.organizationMenu.edit'),
            onPress: () => reserve(),
            icon: <NittroIcon />
        },
        {
            title: t('menu.organizationMenu.createChannel'),
            onPress: () => {
                dismiss();
                navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, {
                    screen: APP_SCREEN.MENU_CLAN.CREATE_CHANNEL,
                    params: {
                        categoryId: category?.category_id
                    }
                });
            },
            icon: <NittroIcon />
        }
    ];

    const devMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.devMode.copyServerID'),
            icon: <NittroIcon />,
            onPress: () => {
                Clipboard.setString(category?.category_id);
                Toast.show({
                    type: 'info',
                    text1: t('notify.serverIDCopied'),
                });
            },
        }
    ];

    const menu: IMezonMenuSectionProps[] = [
        {
            items: watchMenu,
        },
        {
            items: inviteMenu,
        },
        {
            items: notificationMenu,
        },
        {
            items: organizationMenu,
        },
        {
            items: devMenu
        }
    ]

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarWrapper}>
                    <FastImage
                        source={{ uri: currentClan?.logo }}
                        style={{ width: "100%", height: "100%" }}
                    />
                </View>
                <Text style={styles.serverName}>{category?.category_name}</Text>
            </View>

            <View>
                <MezonMenu menu={menu} />
            </View>
        </View>
    )
}