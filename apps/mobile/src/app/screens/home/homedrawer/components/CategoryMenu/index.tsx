import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { ICategoryChannel, IChannel } from "@mezon/utils";
import React, { MutableRefObject } from "react";
import { Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import styles from "./styles";
import { useClans } from "@mezon/core";
import { reserve, IMezonMenuSectionProps, MezonMenu, IMezonMenuItemProps } from "../../../../../../app/temp-ui";
import { useTranslation } from "react-i18next";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-toast-message";
import { NittroIcon } from "@mezon/mobile-components";
import { useNavigation } from "@react-navigation/native";
import { APP_SCREEN, AppStackScreenProps } from "../../../../../../app/navigation/ScreenTypes";
import { darkColor } from "../../../../../../app/constants/Colors";
import Feather from 'react-native-vector-icons/Feather';
import { useBottomSheetModal } from "@gorhom/bottom-sheet";


interface ICategoryMenuProps {
    bottomSheetRef: MutableRefObject<BottomSheetModalMethods>;
    inviteRef:MutableRefObject<any>;
    category: IChannel | ICategoryChannel;
}

type StackMenuClanScreen = typeof APP_SCREEN.MENU_CLAN.STACK;
export default function CategoryMenu({ category, bottomSheetRef, inviteRef }: ICategoryMenuProps) {
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
            onPress: () =>{
              inviteRef.current.open()
              bottomSheetRef?.current?.dismiss();
            },
            icon: <Feather size={16} name="user-plus" style={{ color: darkColor.Backgound_Subtle }} />
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
                <Text style={styles.serverName}>{(category as IChannel)?.channel_label|| category?.category_name}</Text>
            </View>

            <View>
                <MezonMenu menu={menu} />
            </View>
        </View>
    )
}
