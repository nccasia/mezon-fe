import { BottomSheetModal, useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useEventManagement } from "@mezon/core";
import { View } from "react-native";
import EventItem from "./EventItem";
import styles from "./styles";
import { useRef } from "react";
import { EventManagementEntity } from "@mezon/store-mobile";
import EventDetail from "./EventDetail";
import { useState } from "react";
import { MezonBottomSheet, MezonTab } from "../../temp-ui";
import EventMember from "./EventMember";

export default function EventViewer() {
    // const { dismiss } = useBottomSheetModal()
    const { allEventManagement } = useEventManagement();
    const [currentEvent, setCurrentEvent] = useState<EventManagementEntity>();
    const bottomSheetDetail = useRef<BottomSheetModal>(null)

    function handlePress(event: EventManagementEntity) {
        setCurrentEvent(event);
        bottomSheetDetail?.current.present();
    }

    return (
        <View style={styles.container}>
            {allEventManagement?.map((event, index) => (
                <EventItem event={event} key={index.toString()} onPress={() => handlePress(event)} />
            ))}

            <MezonBottomSheet ref={bottomSheetDetail}>
                <MezonTab
                    views={[
                        <EventDetail event={currentEvent} />,
                        <EventMember event={currentEvent} />
                    ]}
                    titles={["Event Info", "Interested"]}
                />
            </MezonBottomSheet>
        </View>
    );
}