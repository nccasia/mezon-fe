import { Text, View } from "react-native";
import MezonBadge from "../../../temp-ui/MezonBadge";
import { CalendarIcon, isSameDay, timeFormat } from "@mezon/mobile-components";
import { EventManagementEntity } from "@mezon/store-mobile";
import styles from "./styles";

interface IEventTimeProps {
    event: EventManagementEntity
}

export default function EventTime({ event }: IEventTimeProps) {
    return (
        <View style={styles.inline}>
            {
                // @ts-ignore
                isSameDay(event.create_time as string) &&
                <MezonBadge title="new" type="success" />
            }
            <CalendarIcon height={20} width={20} />
            <Text style={styles.smallText}>{timeFormat(event.start_time)} </Text>

            {/* Coming soon */}
            {/* Active now */}
        </View>
    )
}