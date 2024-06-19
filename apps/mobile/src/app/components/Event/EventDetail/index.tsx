import { Text, View } from "react-native";
import styles from "./styles";
import EventTime from "../EventTime";
import { EventManagementEntity, selectClanById, selectClanId, selectMemberByUserId } from "@mezon/store-mobile";
import MezonButton from "../../../temp-ui/MezonButton2";
import { BellIcon, CheckIcon, ShareIcon, ThreeDotIcon } from "@mezon/mobile-components";
import MezonAvatar from "../../../temp-ui/MezonAvatar";
import { useSelector } from "react-redux";
import EventLocation from "../EventLocation";
import EventMenu from "../EventMenu";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { MezonBottomSheet } from "../../../temp-ui";

interface IEventDetailProps {
    event: EventManagementEntity
}

export default function EventDetail({ event }: IEventDetailProps) {
    const userCreate = useSelector(selectMemberByUserId(event?.creator_id || ''));
    const clans = useSelector(selectClanById(event?.clan_id || ''));
    const menuBottomSheet = useRef<BottomSheetModal>(null)

    function handlePress() {
        menuBottomSheet?.current?.present();
    }

    return (
        <View style={styles.container}>
            <EventTime event={event} />
            <Text style={styles.title}>{event.title}</Text>

            <View>
                <View style={styles.mainSection}>
                    {/* TODO: Fix this */}
                    <MezonAvatar
                        avatarUrl={clans?.logo}
                        userName={clans?.clan_name}
                        height={20}
                        width={20}
                    />

                    <EventLocation event={event} />

                    <View style={styles.inline}>
                        <BellIcon height={16} width={16} />
                        <Text style={styles.smallText}>{event.user_ids.length}</Text>
                    </View>

                    {/* TODO: Fix this */}
                    <MezonAvatar
                        avatarUrl={userCreate.user.avatar_url}
                        userName={userCreate.user.username}
                        height={20}
                        width={20}
                    />
                </View>
            </View>

            {event.description && <Text style={styles.description}>{event.description}</Text>}

            <View style={styles.inline}>
                {/* <MezonButton title="End event" fluid /> */}
                <MezonButton icon={<CheckIcon height={16} width={16} />} title="Interested" fluid border />
                {/* <MezonButton title="Start event" fluid type="success" /> */}
                <MezonButton icon={<ShareIcon height={20} width={20} />} />
                <MezonButton icon={<ThreeDotIcon height={20} width={20} />} onPress={handlePress} />
            </View>

            <MezonBottomSheet ref={menuBottomSheet}>
                <EventMenu event={event} />
            </MezonBottomSheet>
        </View >
    )
}