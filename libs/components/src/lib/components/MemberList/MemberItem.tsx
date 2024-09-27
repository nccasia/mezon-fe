import { useAuth, useMemberCustomStatus } from '@mezon/core';
import { ChannelMembersEntity } from '@mezon/store';
import { MemberProfileType } from '@mezon/utils';
import { useMemo } from 'react';
import { DataMemberCreate } from '../DmList/MemberListGroupChat';
import MemberProfile from '../MemberProfile';
export type MemberItemProps = {
	user: ChannelMembersEntity;
	listProfile?: boolean;
	isOffline?: boolean;
	positionType?: MemberProfileType;
	dataMemberCreate?: DataMemberCreate;
	directMessageId?: string;
	name?: string;
	isDM: boolean;
};

function MemberItem({ user, listProfile, isOffline, positionType, dataMemberCreate, directMessageId, name, isDM }: MemberItemProps) {
	const userCustomStatus = useMemberCustomStatus(user.user?.id || '', isDM);
	const { userProfile } = useAuth();

	const isMe = useMemo(() => {
		return user?.user?.id === userProfile?.user?.id;
	}, [user?.user?.id, userProfile?.user?.id]);

	return (
		<MemberProfile
			numberCharacterCollapse={30}
			avatar={user.clan_avatar ? user.clan_avatar : (user?.user?.avatar_url ?? '')}
			name={name || ''}
			userNameAva={user?.user?.username}
			status={isMe ? true : user.user?.online}
			customStatus={userCustomStatus}
			isHideStatus={true}
			isHideIconStatus={false}
			textColor="[#AEAEAE]"
			user={user}
			listProfile={listProfile}
			isOffline={isMe ? false : isOffline}
			positionType={positionType}
			dataMemberCreate={dataMemberCreate}
			hideLongName={true}
		/>
	);
}

export default MemberItem;
