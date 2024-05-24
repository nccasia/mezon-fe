import { useChannelMembers } from "@mezon/core";
import { selectCurrentChannelId } from "@mezon/store-mobile";
import { Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import MemberItem from "./MemberItem";

import style from "./style";
import { AddMemberIcon, AngleRightIcon } from "@mezon/mobile-components";

export default function MemberListStatus() {
    const currentChannelId = useSelector(selectCurrentChannelId);
    const { onlineMembers, offlineMembers } = useChannelMembers({ channelId: currentChannelId });

    return (
        <ScrollView contentContainerStyle={style.container}>
            <Pressable>
                <View style={style.inviteBtn}>
                    <View style={style.iconNameWrapper}>
                        <View style={style.iconWrapper}>
                            <AddMemberIcon height={16} width={16} />
                        </View>
                        <Text style={style.text}>Invite Members</Text>
                    </View>
                    <View>
                        <AngleRightIcon height={22} width={22} />
                    </View>
                </View>
            </Pressable>

            {onlineMembers.length > 0 && (
                <View>
                    <Text style={style.text}>Member - {onlineMembers.length}</Text>
                    <View style={style.box}>
                        {onlineMembers.map((user) => (
                            <MemberItem
                                user={user}
                                key={user?.user?.id}
                            />
                        ))}
                    </View>
                </View>
            )}

            {offlineMembers.length > 0 && (
                <View style={{ marginTop: 20 }}>
                    <Text style={style.text}>Offline - {offlineMembers.length}</Text>
                    <View style={style.box}>
                        {offlineMembers.map((user) => (
                            <MemberItem
                                key={user.id}
                                user={user}
                                isOffline={true}
                            />
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    )
}
