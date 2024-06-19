import { EventManagementEntity, selectChannelById, selectMemberByUserId } from "@mezon/store-mobile";
import { Pressable, Text, View } from "react-native";
import styles from "./styles";
import { CheckIcon, LocationIcon, MemberListIcon, ShareIcon, SpeakerIcon } from "@mezon/mobile-components";
import FastImage from "react-native-fast-image";
import { useSelector } from "react-redux";
import { OptionEvent } from "@mezon/utils";
import MezonButton from "../../../temp-ui/MezonButton2";
import EventTime from "../EventTime";
import EventLocation from "../EventLocation";

interface IEventItemProps {
    event: EventManagementEntity,
    onPress?: () => void
}

export default function EventItem({ event, onPress }: IEventItemProps) {
    const userCreate = useSelector(selectMemberByUserId(event?.creator_id || ''));
    const option = event.address ? OptionEvent.OPTION_LOCATION : OptionEvent.OPTION_SPEAKER;
    const channelVoice = useSelector(selectChannelById(event?.channel_id));
    // const channelFirst = useSelector(selectChannelFirst);

    function handlePress() {
        onPress && onPress();
    }

    return (
        <Pressable onPress={handlePress}>
            <View style={styles.container}>
                <View style={styles.infoSection}>
                    <EventTime event={event} />

                    <View style={[styles.inline, styles.infoRight]}>
                        <View style={styles.avatar}>
                            <FastImage
                                source={{ uri: userCreate.user.avatar_url }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.inline}>
                            <MemberListIcon height={10} width={10} />
                            <Text style={styles.tinyText}>{event.user_ids.length}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mainSec}>
                    <Text style={{ color: "white" }}>{event.title}</Text>
                    {event.description && <Text style={styles.description}>{event.description}</Text>}
                    <EventLocation event={event} />
                </View>

                <View style={styles.inline}>
                    {/* <MezonButton title="End event" fluid /> */}
                    <MezonButton icon={<CheckIcon height={16} width={16} />} title="Interested" fluid border />
                    {/* <MezonButton title="Start event" fluid type="success" /> */}
                    <MezonButton icon={<ShareIcon height={20} width={20} />} />
                </View>
            </View>
        </Pressable>
    )
}