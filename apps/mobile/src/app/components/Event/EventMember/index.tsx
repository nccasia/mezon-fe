import { View } from "react-native";
import styles from "./styles";
import { EventManagementEntity, selectMemberByUserId } from "@mezon/store-mobile";
import { useSelector } from "react-redux";
import MezonAvatar from "../../../temp-ui/MezonAvatar";

interface IEventMemberProps {
    event: EventManagementEntity;
}

const renderAvatar = (id: string, index: number) => {
    const user = useSelector(selectMemberByUserId(id || ""))

    return (
        <MezonAvatar
            key={index.toString()}
            height={40}
            width={40}
            avatarUrl={user.user?.avatar_url}
            userName={user.user?.username}
            userStatus={user.user?.online}
        />
    )
}

export default function EventMember({ event }: IEventMemberProps) {
    return (
        <View style={styles.container}>
            {event.user_ids.map((uid, index) => renderAvatar(uid, index))}
        </View>
    )
}