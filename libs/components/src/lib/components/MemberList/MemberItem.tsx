import { useMemberStatus } from '@mezon/core';
import { ChannelMembersEntity } from '@mezon/store';
import MemberProfile from '../MemberProfile';
export type MemberItemProps = {
	user: ChannelMembersEntity;
};

function MemberItem({ user }: MemberItemProps) {
	const userStatus = useMemberStatus(user.user?.id || '');
	return (
		<MemberProfile
			numberCharacterCollapse={30}
			avatar={user?.user?.avatar_url ?? ''}
			name={user?.user?.username ?? ''}
			status={userStatus}
			isHideStatus={true}
			isHideIconStatus={userStatus ? false : true}
			textColor="[#AEAEAE]"
		/>
	);
}

export default MemberItem;
