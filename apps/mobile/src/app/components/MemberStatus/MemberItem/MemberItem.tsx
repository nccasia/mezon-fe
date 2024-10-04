import { useMemberStatus } from '@mezon/core';
import { ChannelMembersEntity, DirectEntity, selectCurrentClan, selectUserClanProfileByClanID } from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { MemberProfile } from '../MemberProfile';

interface IProps {
	user: ChannelMembersEntity;
	listProfile?: boolean;
	isOffline?: boolean;
	onPress?: (user: ChannelMembersEntity) => void;
	currentChannel?: IChannel | DirectEntity;
	isDMThread?: boolean;
}

export function MemberItem({ user, isOffline, onPress, currentChannel, isDMThread }: IProps) {
	const userStatus = useMemberStatus(user?.user?.id || '');
	const currentClan = useSelector(selectCurrentClan);
	const clanProfile = useSelector(selectUserClanProfileByClanID(currentClan?.clan_id as string, user?.user?.id as string));
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={() => {
				onPress(user);
			}}
		>
			<MemberProfile
				user={user}
				status={userStatus}
				numCharCollapse={30}
				isHideIconStatus={userStatus ? false : true}
				isOffline={isOffline}
				nickName={clanProfile?.nick_name}
				creatorClanId={currentClan?.creator_id}
				creatorDMId={currentChannel?.creator_id}
				isDMThread={isDMThread}
			/>
		</TouchableOpacity>
	);
}
