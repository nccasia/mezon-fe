import { EventManagementEntity } from "@mezon/store-mobile";
import MezonMenu, { reserve } from "../../../temp-ui/MezonMenu";
import { IMezonMenuSectionProps } from "../../../temp-ui/MezonMenuSection";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import styles from "./styles";

interface IEventMenuProps {
    event: EventManagementEntity;
}

export default function EventMenu({ event }: IEventMenuProps) {
    const { t } = useTranslation(['eventMenu']);

    const menu: IMezonMenuSectionProps[] = [
        {
            items: [
                {
                    title: t('menu.startEvent'),
                    onPress: () => reserve()
                },
                {
                    title: t('menu.markAsNotInterested'),
                    onPress: () => reserve()
                },
                {
                    title: t('menu.markAsInterested'),
                    onPress: () => reserve()
                },
                {
                    title: t('menu.editEvent'),
                    onPress: () => reserve()
                },
                {
                    title: t('menu.cancelEvent'),
                    onPress: () => reserve(),
                    textStyle: { color: "red" }
                },
                {
                    title: t('menu.reportEvent'),
                    onPress: () => reserve(),
                    textStyle: { color: "red" }
                },
                {
                    title: t('menu.copyEventLink'),
                    onPress: () => reserve()
                },
                {
                    title: t('menu.copyEventID'),
                    onPress: () => reserve()
                }
            ]
        }
    ]

    return (
        <View style={styles.container}>
            <MezonMenu menu={menu} />
        </View>
    )
}