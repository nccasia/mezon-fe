import { Pressable, ScrollView, Text, View } from "react-native";
import { APP_SCREEN, MenuClanScreenProps } from "../../navigation/ScreenTypes";
import { useState } from "react";
import { CrossIcon, NittroIcon } from "@mezon/mobile-components";
import { useTranslation } from "react-i18next";
import MezonInput from "../../temp-ui/MezonInput2";
import { ApiCreateChannelDescRequest } from "mezon-js/api.gen";
import { useSelector } from "react-redux";
import { createNewChannel, selectCurrentChannel, selectCurrentClanId } from "@mezon/store-mobile";
import styles from "./styles";
import MezonToggleButton from "../../temp-ui/MezonToggleButton";
import { useMemo } from "react";
import { IMezonMenuSectionProps, MezonMenu, MezonOption } from "../../temp-ui";
import { ChannelType } from "mezon-js";
import { useAppDispatch } from "@mezon/store";
import { validInput } from "../../utils/validate";

type CreateChannelScreen = typeof APP_SCREEN.MENU_CLAN.CREATE_CHANNEL;
export default function ChannelCreator({ navigation, route }: MenuClanScreenProps<CreateChannelScreen>) {
    const [isChannelPrivate, setChannelPrivate] = useState<boolean>(false);
    const [channelName, setChannelName] = useState<string>("");
    const [channelType, setChannelType] = useState<ChannelType>(ChannelType.CHANNEL_TYPE_TEXT);
    const currentClanId = useSelector(selectCurrentClanId);
    const currentChannel = useSelector(selectCurrentChannel);
    // @ts-ignore
    const { categoryId } = route.params;

    const { t } = useTranslation(['channelCreator']);
    const dispatch = useAppDispatch();

    navigation.setOptions({
        headerRight: () => (
            <Pressable onPress={handleCreateChannel}>
                <Text style={{
                    color: "white",
                    paddingHorizontal: 20,
                    opacity: channelName.trim().length > 0 ? 1 : 0.5
                }}>
                    {t("actions.create")}
                </Text>
            </Pressable>
        ),

        headerLeft: () => (
            <Pressable style={{ padding: 20 }} onPress={handleClose}>
                <CrossIcon height={16} width={16} />
            </Pressable>
        ),
    });

    async function handleCreateChannel() {
        if (!validInput(channelName)) return;

        const body: ApiCreateChannelDescRequest = {
            clan_id: currentClanId?.toString(),
            type: channelType,
            channel_label: channelName.trim(),
            channel_private: isChannelPrivate ? 1 : 0,
            category_id: categoryId || currentChannel.category_id,
        };

        console.log(body);
        await dispatch(createNewChannel(body));
        setChannelName('');
        navigation.navigate(APP_SCREEN.HOME);
    }

    function handleClose() {
        navigation.goBack();
    }

    const ToggleBtn = () => <MezonToggleButton
        onChange={(value: boolean) => setChannelPrivate(value)}
        height={25}
        width={45}
    />

    const menuPrivate = useMemo(() => ([
        {
            bottomDescription: channelType === ChannelType.CHANNEL_TYPE_TEXT
                ? t("fields.channelPrivate.descriptionText")
                : t("fields.channelPrivate.descriptionVoice"),
            items: [
                {
                    title: t('fields.channelPrivate.title'),
                    component: <ToggleBtn />,
                    icon: <NittroIcon />
                }
            ]
        }
    ]) satisfies IMezonMenuSectionProps[], [channelType])

    const channelTypeList = [
        {
            title: t('fields.channelType.text.title'),
            description: t('fields.channelType.text.description'),
            value: ChannelType.CHANNEL_TYPE_TEXT
        },
        {
            title: t('fields.channelType.voice.title'),
            description: t('fields.channelType.voice.description'),
            value: ChannelType.CHANNEL_TYPE_VOICE
        }
    ]

    function handleChannelTypeChange(value: number) {
        setChannelType(value);
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <MezonInput
                value={channelName}
                onTextChange={setChannelName}
                label={t('fields.channelName.title')}
                errorMessage={t('fields.channelName.errorMessage')}
                placeHolder={t('fields.channelName.placeholder')} />
            <View style={styles.menu}>
                <MezonOption
                    title={t('fields.channelType.title')}
                    data={channelTypeList}
                    onChange={handleChannelTypeChange} />

                <MezonMenu menu={menuPrivate} />
            </View>
        </ScrollView>
    )
}
