import { useAuth, useClans, useEventManagement } from "@mezon/core";
import { Icons } from "@mezon/mobile-components";
import { Fonts, useTheme } from "@mezon/mobile-ui";
import { OptionEvent } from "@mezon/utils";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { APP_SCREEN, MenuClanScreenProps } from "../../../navigation/ScreenTypes";
import MezonButton from "../../../temp-ui/MezonButton2";
import EventItem from "../../Event/EventItem";
import { style } from "./styles";

type CreateEventScreenType = typeof APP_SCREEN.MENU_CLAN.CREATE_EVENT_PREVIEW;
export default function EventCreatorPreview({ navigation, route }: MenuClanScreenProps<CreateEventScreenType>) {
    const { themeValue } = useTheme();
    const styles = style(themeValue);
    const { t } = useTranslation(['eventCreator']);
    const myUser = useAuth();
    const { createEventManagement } = useEventManagement();
    const { currentClanId } = useClans();
    const {
        type, channelId, location, startTime, endTime,
        title, description, frequency, onGoBack
    } = route.params || {};

    navigation.setOptions({
        headerTitle: t('screens.eventPreview.headerTitle'),
        headerTitleStyle: {
            fontSize: Fonts.size.h7,
            color: themeValue.textDisabled
        },
        headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.goBack()}>
                <Icons.ArrowLargeLeftIcon height={18} width={18} color={themeValue.textStrong} />
            </TouchableOpacity>
        ),
        headerRight: () => (
            <TouchableOpacity style={{ marginRight: 20 }} onPress={handleClose}>
                <Icons.CloseLargeIcon height={18} width={18} color={themeValue.textStrong} />
            </TouchableOpacity>
        )
    })

    function handleClose() {
        onGoBack?.();
        navigation.navigate(APP_SCREEN.HOME);
    }

    async function handleCreate() {
        const timeValueStart = (startTime as Date).toISOString();
        const timeValueEnd = (endTime as Date).toISOString();

        if (type === OptionEvent.OPTION_SPEAKER) {
            await createEventManagement(currentClanId || '', channelId, title, title, timeValueStart, timeValueStart, description, '');
        } else {
            await createEventManagement(currentClanId || '', channelId, title, title, timeValueStart, timeValueEnd, description, '');
        }
        onGoBack?.();
        navigation.navigate(APP_SCREEN.HOME);
    }

    return (
        <View style={styles.container}>
            <View style={styles.feedSection}>
                <EventItem
                    event={{
                        id: '',
                        start_time: startTime.toString(),
                        address: location,
                        user_ids: [],
                        creator_id: myUser.userId,
                        title: title,
                        description: description,
                        channel_id: channelId,
                    }}
                />

                <View style={styles.headerSection}>
                    <Text style={styles.title}>{t('screens.eventPreview.title')}</Text>
                    {type === OptionEvent.OPTION_LOCATION ? (
                        <Text style={styles.subtitle}>{t('screens.eventPreview.subtitle')}</Text>
                    ) : (
                        <Text style={styles.subtitle}>{t('screens.eventPreview.subtitleVoice')}</Text>
                    )}
                </View>
            </View>

            <View style={styles.btnWrapper}>
                <MezonButton
                    title={t('actions.create')}
                    titleStyle={{ fontSize: Fonts.size.h7 }}
                    type="success"
                    onPress={handleCreate}
                />
            </View>
        </View>
    )
}
