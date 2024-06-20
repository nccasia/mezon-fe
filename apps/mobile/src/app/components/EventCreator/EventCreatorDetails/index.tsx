import { ScrollView, Text, View } from "react-native";
import styles from "./styles";
import { useTranslation } from "react-i18next";
import { APP_SCREEN, MenuClanScreenProps } from "../../../navigation/ScreenTypes";
import { MezonDateTimePicker, MezonInput, MezonSelect } from "../../../temp-ui";
import MezonButton from "../../../temp-ui/MezonButton2";
import { useState } from "react";
import { getNearTime } from "@mezon/mobile-components";
import { OptionEvent } from "@mezon/utils";
import Toast from "react-native-toast-message";

type CreateEventScreenDetails = typeof APP_SCREEN.MENU_CLAN.CREATE_EVENT_DETAILS;
export default function EventCreatorDetails({ navigation, route }: MenuClanScreenProps<CreateEventScreenDetails>) {
    const { t } = useTranslation(['eventCreator']);

    // @ts-ignore
    const { type, channelId, location } = route.params;

    navigation.setOptions({
        headerTitle: t('screens.eventDetails.headerTitle')
    })

    const options = [
        {
            title: t('fields.eventFrequency.noRepeat'),
            value: 0
        },
        {
            title: t('fields.eventFrequency.weeklyOn'),
            value: 1
        },
        {
            title: t('fields.eventFrequency.everyOther'),
            value: 2
        },
        {
            title: t('fields.eventFrequency.monthlyOn'),
            value: 3
        },
        {
            title: t('fields.eventFrequency.annuallyOn'),
            value: 4
        },
        {
            title: t('fields.eventFrequency.everyWeekday'),
            value: 5
        },
    ]

    const [eventTitle, setEventTitle] = useState<string>("");
    const [eventDescription, setEventDescription] = useState<string>("");
    const [startTime, setStartTime] = useState<Date>(getNearTime(120));
    const [endTime, setEndTime] = useState<Date>(getNearTime(240));
    const [eventFrequency, setEventFrequency] = useState<number>(0);

    function handleFrequencyChange(value: number) {
        setEventFrequency(value);
    }

    function handlePressNext() {
        if (eventTitle.trim().length === 0) {
            Toast.show({
                type: "error",
                text1: t("notify.titleBlank")
            })
            return;
        }

        navigation.navigate(APP_SCREEN.MENU_CLAN.CREATE_EVENT_PREVIEW, {
            type,
            channelId,
            location,
            title: eventTitle,
            description: eventDescription,
            startTime,
            endTime,
            frequency: eventFrequency,
        });
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.feedSection}>
                <View style={styles.headerSection}>
                    <Text style={styles.title}>{t('screens.eventDetails.title')}</Text>
                    <Text style={styles.subtitle}>{t('screens.eventDetails.subtitle')}</Text>
                </View>

                <View style={styles.section}>
                    <MezonInput
                        label={t("fields.eventName.title")}
                        value={eventTitle}
                        onTextChange={setEventTitle}
                        placeHolder={t('fields.eventName.placeholder')}
                    />

                    <View style={styles.inlineSec}>
                        <View style={{ flex: 2 }}>
                            <MezonDateTimePicker
                                title={t('fields.startDate.title')}
                                onChange={(value) => setStartTime(value)}
                                value={startTime}
                                keepTime
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <MezonDateTimePicker
                                title={t('fields.startTime.title')}
                                mode="time"
                                onChange={(value) => setStartTime(value)}
                                value={startTime}
                            />
                        </View>
                    </View>

                    {type === OptionEvent.OPTION_LOCATION &&
                        <View style={styles.inlineSec}>
                            <View style={{ flex: 2 }}>
                                <MezonDateTimePicker
                                    title={t('fields.endDate.title')}
                                    onChange={(value) => setEndTime(value)}
                                    value={endTime}
                                    keepTime
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <MezonDateTimePicker
                                    title={t('fields.endTime.title')}
                                    mode="time"
                                    onChange={(value) => setEndTime(value)}
                                    value={endTime}
                                />
                            </View>
                        </View>
                    }

                    <MezonInput
                        label={t("fields.description.title")}
                        value={eventDescription}
                        onTextChange={setEventDescription}
                        textarea
                        placeHolder={t('fields.description.description')}
                    />

                    <MezonSelect
                        title={t('fields.eventFrequency.title')}
                        data={options}
                        onChange={handleFrequencyChange}
                    />
                </View>
            </View>

            <MezonButton
                title={t('actions.next')}
                type="success"
                onPress={handlePressNext}
            />
        </ScrollView>
    )
}