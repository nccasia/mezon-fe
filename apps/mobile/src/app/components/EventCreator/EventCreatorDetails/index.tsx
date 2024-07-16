import { getDayName, getDayWeekName, getDayYearName, getNearTime, Icons } from "@mezon/mobile-components";
import { Fonts, useTheme } from "@mezon/mobile-ui";
import { OptionEvent } from "@mezon/utils";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { APP_SCREEN, MenuClanScreenProps } from "../../../navigation/ScreenTypes";
import { MezonDateTimePicker, MezonInput, MezonSelect } from "../../../temp-ui";
import MezonButton from "../../../temp-ui/MezonButton2";
import { style } from "./styles";

type CreateEventScreenDetails = typeof APP_SCREEN.MENU_CLAN.CREATE_EVENT_DETAILS;
export default function EventCreatorDetails({ navigation, route }: MenuClanScreenProps<CreateEventScreenDetails>) {
    const { themeValue } = useTheme();
    const styles = style(themeValue);
    const { t, i18n } = useTranslation(['eventCreator']);
    const { type, channelId, location, onGoBack } = route.params || {};

    const language = useMemo(() => i18n.language === "vi" ? "vi" : "en", [i18n])

    navigation.setOptions({
        headerTitle: t('screens.eventDetails.headerTitle'),
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

    const [eventTitle, setEventTitle] = useState<string>("");
    const [eventDescription, setEventDescription] = useState<string>("");
    const [startTime, setStartTime] = useState<Date>(getNearTime(120));
    const [endTime, setEndTime] = useState<Date>(getNearTime(240));
    const [eventFrequency, setEventFrequency] = useState<number>(0);

    const options = useMemo(() => [
        {
            title: t('fields.eventFrequency.noRepeat'),
            value: 0
        },
        {
            title: t('fields.eventFrequency.weeklyOn', { name: getDayName(startTime, language) }),
            value: 1
        },
        {
            title: t('fields.eventFrequency.everyOther', { name: getDayName(startTime, language) }),
            value: 2
        },
        {
            title: t('fields.eventFrequency.monthlyOn', { name: getDayWeekName(startTime, language) }),
            value: 3
        },
        {
            title: t('fields.eventFrequency.annuallyOn', { name: getDayYearName(startTime, language) }),
            value: 4
        },
        {
            title: t('fields.eventFrequency.everyWeekday'),
            value: 5
        },
    ], [startTime]);

    function handleFrequencyChange(value: number) {
        setEventFrequency(value);
    }

    function handlePressNext() {
        if (eventTitle?.trim()?.length === 0) {
            Toast.show({
                type: 'error',
                text1: t('notify.titleBlank'),
            });
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
            onGoBack: onGoBack
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.feedSection}>
                <ScrollView>
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{t('screens.eventDetails.title')}</Text>
                        <Text style={styles.subtitle}>{t('screens.eventDetails.subtitle')}</Text>
                    </View>

                    <View style={styles.section}>
                        <MezonInput
                            label={t("fields.eventName.title")}
                            titleUppercase
                            value={eventTitle}
                            onTextChange={setEventTitle}
                            placeHolder={t('fields.eventName.placeholder')}
                        />

                        <View style={styles.inlineSec}>
                            <View style={{ flex: 2 }}>
                                <MezonDateTimePicker
                                    title={t('fields.startDate.title')}
                                    titleUppercase
                                    onChange={(value) => setStartTime(value)}
                                    value={startTime}
                                    keepTime
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <MezonDateTimePicker
                                    title={t('fields.startTime.title')}
                                    titleUppercase
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
                            titleUppercase
                            onTextChange={setEventDescription}
                            textarea
                            placeHolder={t('fields.description.description')}
                        />

                        <MezonSelect
                            title={t('fields.eventFrequency.title')}
                            titleUppercase
                            data={options}
                            onChange={handleFrequencyChange}
                        />
                    </View>
                </ScrollView>
            </View>

            <View style={styles.btnWrapper}>
                <MezonButton
                    title={t('actions.next')}
                    titleStyle={{ fontSize: Fonts.size.h7 }}
                    type="success"
                    onPress={handlePressNext}
                />
            </View>
        </View>
    )
}
