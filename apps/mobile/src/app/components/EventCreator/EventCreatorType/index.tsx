import { Text, View } from "react-native";
import { MenuClanScreenProps, APP_SCREEN } from "../../../navigation/ScreenTypes";
import { MezonInput, MezonOption, MezonSelect } from "../../../temp-ui";
import { useTranslation } from "react-i18next";
import styles from "./styles";
import { SpeakerIcon } from "@mezon/mobile-components";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectVoiceChannelAll } from "@mezon/store-mobile";
import MezonButton from "../../../temp-ui/MezonButton2";
import { OptionEvent } from "@mezon/utils";
import Toast from "react-native-toast-message";


type CreateEventScreenType = typeof APP_SCREEN.MENU_CLAN.CREATE_EVENT;
export default function EventCreatorType({ navigation }: MenuClanScreenProps<CreateEventScreenType>) {
    const { t } = useTranslation(['eventCreator']);
    const voicesChannel = useSelector(selectVoiceChannelAll);

    navigation.setOptions({
        headerTitle: t('screens.eventType.headerTitle')
    })

    const options = [
        {
            title: t('fields.channelType.voiceChannel.title'),
            description: t('fields.channelType.voiceChannel.description'),
            value: OptionEvent.OPTION_SPEAKER
        },
        {
            title: t('fields.channelType.somewhere.title'),
            description: t('fields.channelType.somewhere.description'),
            value: OptionEvent.OPTION_LOCATION
        }
    ]

    const channels = voicesChannel.map(item => ({
        title: item.channel_label,
        value: item.channel_id
    }))

    const [eventType, setEventType] = useState<OptionEvent>(OptionEvent.OPTION_SPEAKER);
    const [channelID, setChannelID] = useState<string>(channels?.[0]?.value || "")
    const [location, setLocation] = useState<string>("");

    function handleEventTypeChange(value: OptionEvent) {
        setEventType(value);
    }

    function handlePressNext() {
        if (eventType === OptionEvent.OPTION_LOCATION) {
            if (location.trim().length === 0) {
                Toast.show({
                    type: "error",
                    text1: t("notify.locationBlank")
                })
                return;
            }
        }

        navigation.navigate(APP_SCREEN.MENU_CLAN.CREATE_EVENT_DETAILS, {
            type: eventType,
            channelId: eventType === OptionEvent.OPTION_SPEAKER ? channelID : null,
            location: eventType === OptionEvent.OPTION_LOCATION ? location : null,
        });
    }

    function handleChannelIDChange(value: string | number) {
        setChannelID(value as string);
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <Text style={styles.title}>{t('screens.eventType.title')}</Text>
                <Text style={styles.subtitle}>{t('screens.eventType.subtitle')}</Text>
            </View>

            <MezonOption
                data={options}
                onChange={handleEventTypeChange}
            />

            {
                eventType === OptionEvent.OPTION_SPEAKER
                    ? <MezonSelect
                        title={t('fields.channel.title')}
                        onChange={handleChannelIDChange}
                        data={channels} icon={<SpeakerIcon height={20} width={20} />}
                    />

                    : <MezonInput
                        onTextChange={setLocation} value={location}
                        inputWrapperStyle={styles.input}
                        label={t('fields.address.title')}
                        placeHolder={t('fields.address.placeholder')}
                    />
            }

            <Text style={styles.bottomDescription}>{t('screens.eventType.description')}</Text>

            <MezonButton
                title={t('actions.next')}
                type="success"
                onPress={handlePressNext}
            />
        </View>
    )
}