import { ChannelMembersEntity } from "@mezon/store";
import MemberItem from "./MemberItem";

type ListMemberProps = {
    lisMembers: ChannelMembersEntity[];
    isOffline: boolean;
}

const ListMember = (props: ListMemberProps) => {
    const {lisMembers, isOffline} = props;
    return (
        lisMembers.map((user) => (
            <MemberItem user={user} key={user?.user?.id} listProfile={true} isOffline={isOffline}/>
		))
    )
}

export default ListMember;