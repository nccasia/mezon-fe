import { selectVoiceChannelMembersByChannelId } from '@mezon/store';
import React, { memo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import UserVoiceItem from '../ChannelListUserVoiceItem';

interface IUserListVoiceChannelProps {
	channelId: string;
}

export default memo(function ChannelListUserVoice({ channelId }: IUserListVoiceChannelProps) {
	const voiceChannelMember = useSelector(selectVoiceChannelMembersByChannelId(channelId));

	return (
		<View>
			{voiceChannelMember?.length
				? voiceChannelMember?.map((userVoice, index) => (
						<UserVoiceItem key={`${index}_voice_item_${userVoice?.participant}`} userVoice={userVoice} />
					))
				: null}
		</View>
	);
});
