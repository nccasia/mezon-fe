import { useMemberStatus } from '@mezon/core';
import { ChannelMembersEntity } from '@mezon/store-mobile';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MemberProfile from '../MemberProfile';

interface IProps {
	user: ChannelMembersEntity;
	listProfile?: boolean;
	isOffline?: boolean;
	onPress?: (user: ChannelMembersEntity) => void;
}

export default function MemberItem({ user, isOffline, onPress }: IProps) {
	const userStatus = useMemberStatus(user.user?.id || '');
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={() => {
				onPress(user);
			}}
		>
			<MemberProfile user={user} status={userStatus} numCharCollapse={30} isHideIconStatus={userStatus ? false : true} isOffline={isOffline} />
		</TouchableOpacity>
	);
}
