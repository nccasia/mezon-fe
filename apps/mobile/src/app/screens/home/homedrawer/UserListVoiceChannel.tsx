import { IChannelMember } from '@mezon/utils';
import React from 'react';
import { View } from 'react-native';
import UserVoiceItem from './UserVoiceItem';

interface IUserListVoiceChannelProps {
	userListVoice: IChannelMember[];
}
const UserListVoiceChannel = React.memo(({ userListVoice }: IUserListVoiceChannelProps) => {
	return <View>{userListVoice?.length ? userListVoice?.map((userVoice) => <UserVoiceItem userVoice={userVoice} />) : null}</View>;
});

export default UserListVoiceChannel;
