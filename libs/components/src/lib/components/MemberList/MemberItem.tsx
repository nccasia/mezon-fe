import { useMemberCustomStatus, useMemberStatus } from '@mezon/core';
import { ChannelMembersEntity, selectCurrentClan, selectUserClanProfileByClanID } from '@mezon/store';
import { MemberProfileType } from '@mezon/utils';
import { useSelector } from 'react-redux';
import { DataMemberCreate } from '../DmList/MemberListGroupChat';
import MemberProfile from '../MemberProfile';
export type MemberItemProps = {
	user: ChannelMembersEntity;
	listProfile?: boolean;
	isOffline?: boolean;
	positionType?: MemberProfileType;
	dataMemberCreate?: DataMemberCreate;
};

function MemberItem({ user, listProfile, isOffline, positionType, dataMemberCreate }: MemberItemProps) {
	const userStatus = useMemberStatus(user.user?.id || '');
	const currentClan = useSelector(selectCurrentClan);
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, user?.user?.id as string));
	const userCustomStatus = useMemberCustomStatus(user.user?.id || '');
	return (
		<MemberProfile
			numberCharacterCollapse={30}
			avatar={user?.user?.avatar_url ?? ''}
			name={
				positionType === MemberProfileType.DM_MEMBER_GROUP
					? user?.user?.display_name || ''
					: clanProfile?.nick_name || user?.user?.display_name || user?.user?.username || ''
			}
			userNameAva={user?.user?.username}
			status={userStatus}
			customStatus={userCustomStatus}
			isHideStatus={true}
			isHideIconStatus={userStatus ? false : true}
			textColor="[#AEAEAE]"
			user={user}
			listProfile={listProfile}
			isOffline={isOffline}
			positionType={positionType}
			dataMemberCreate={dataMemberCreate}
		/>
	);
}

export default MemberItem;
