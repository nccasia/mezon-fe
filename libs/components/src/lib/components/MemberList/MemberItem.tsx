import { useMemberCustomStatus, useMemberStatus } from '@mezon/core';
import { ChannelMembersEntity, selectCurrentClan, selectUserClanProfileByClanID } from '@mezon/store';
import { MemberProfileType } from '@mezon/utils';
import { useSelector } from 'react-redux';
import MemberProfile from '../MemberProfile';
export type MemberItemProps = {
	user: ChannelMembersEntity;
	listProfile?: boolean;
	isOffline?: boolean;
};

function MemberItem({ user, listProfile, isOffline }: MemberItemProps) {
	const userStatus = useMemberStatus(user.user?.id || '');
	const currentClan = useSelector(selectCurrentClan);
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, user?.user?.id as string));
	const userCustomStatus = useMemberCustomStatus(user.user?.id || '')
	return (
		<MemberProfile
			numberCharacterCollapse={30}
			avatar={user?.user?.avatar_url ?? ''}
			name={clanProfile?.nick_name || user?.user?.display_name || user?.user?.username || ''}
			userNameAva={user?.user?.username}
			status={userStatus}
			customStatus={userCustomStatus}
			isHideStatus={true}
			isHideIconStatus={userStatus ? false : true}
			textColor="[#AEAEAE]"
			user={user}
			listProfile={listProfile}
			isOffline={isOffline}
			positionType={MemberProfileType.MEMBER_LIST}
		/>
	);
}

export default MemberItem;
