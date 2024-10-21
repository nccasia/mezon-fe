import { size } from '@mezon/mobile-ui';
import { selectVoiceChannelMembersByChannelId } from '@mezon/store';
import React, { memo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import UserVoiceItem from '../ChannelListUserVoiceItem';

interface IUserListVoiceChannelProps {
	channelId: string;
	isCategoryExpanded: boolean;
}

export default memo(function ChannelListUserVoice({ channelId, isCategoryExpanded }: IUserListVoiceChannelProps) {
	const voiceChannelMember = useSelector(selectVoiceChannelMembersByChannelId(channelId));

	return (
		<View style={[!isCategoryExpanded && { flexDirection: 'row', marginLeft: size.s_30 }]}>
			{voiceChannelMember?.length
				? voiceChannelMember?.map((userVoice, index) => (
						<UserVoiceItem
							key={`${index}_voice_item_${userVoice?.participant}`}
							index={index}
							userVoice={userVoice}
							isCategoryExpanded={isCategoryExpanded}
							totalMembers={voiceChannelMember?.length}
						/>
					))
				: null}
		</View>
	);
});
