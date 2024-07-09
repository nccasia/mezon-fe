import { ICategoryChannel, IChannel } from "@mezon/utils";
import React, { MutableRefObject } from "react";
import { Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useClans } from "@mezon/core";
import { reserve, IMezonMenuSectionProps, MezonMenu, IMezonMenuItemProps } from "../../../../../../app/temp-ui";
import { useTranslation } from "react-i18next";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { APP_SCREEN, AppStackScreenProps } from "../../../../../../app/navigation/ScreenTypes";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Icons } from "@mezon/mobile-components";
import { useTheme } from "@mezon/mobile-ui";
import { style } from "./styles";


interface ICategoryMenuProps {
    inviteRef: MutableRefObject<any>;
    category: ICategoryChannel;
}

type StackMenuClanScreen = typeof APP_SCREEN.MENU_CLAN.STACK;
export default function CategoryMenu({ category, inviteRef }: ICategoryMenuProps) {
    const { t } = useTranslation(['categoryMenu']);
    const {themeValue} = useTheme()
    const styles = style(themeValue) 
    const { currentClan } = useClans();
    const { dismiss } = useBottomSheetModal();

    const navigation = useNavigation<AppStackScreenProps<StackMenuClanScreen>['navigation']>()

    const watchMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.watchMenu.markAsRead'),
            onPress: () => reserve(),
            icon: <Icons.EyeIcon color={themeValue.textStrong}/>
        }
    ]

    const inviteMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.inviteMenu.invite'),
            onPress: () => {
                inviteRef.current.present()
                dismiss();
            },
            icon: <Icons.GroupPlusIcon color={themeValue.textStrong}/>
        }
    ]

    const notificationMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.notification.muteCategory'),
            onPress: () => reserve(),
            icon: <Icons.BellSlashIcon color={themeValue.textStrong}/>
        },
        {
            title: t('menu.notification.notification'),
            onPress: () => reserve(),
            icon: <Icons.ChannelNotificationIcon color={themeValue.textStrong}/>
        }
    ]

    const organizationMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.organizationMenu.edit'),
            onPress: () => reserve(),
            icon: <Icons.SettingsIcon color={themeValue.textStrong}/>
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
            icon: <Icons.PlusLargeIcon color={themeValue.textStrong}/>
        }
    ];

    const devMenu: IMezonMenuItemProps[] = [
        {
            title: t('menu.devMode.copyServerID'),
            icon: <Icons.IDIcon color={themeValue.textStrong}/>,
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
