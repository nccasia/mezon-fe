import { selectStreamMembersByChannelId, selectVoiceChannelMembersByChannelId } from '@mezon/store';
import { IChannelMember } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import UserListItem from './UserListItemVoiceChannel';

export type UserListVoiceChannelProps = {
	readonly channelID: string;
	channelType?: number;
};

function UserListVoiceChannel({ channelID, channelType }: UserListVoiceChannelProps) {
	const voiceChannelMember = useSelector(selectVoiceChannelMembersByChannelId(channelID));
	const streamChannelMember = useSelector(selectStreamMembersByChannelId(channelID));
	const listMember =
		channelType === ChannelType.CHANNEL_TYPE_VOICE
			? voiceChannelMember
			: channelType === ChannelType.CHANNEL_TYPE_STREAMING
				? streamChannelMember
				: [];

	return listMember?.map((item: IChannelMember, index: number) => {
		return (
			<div key={item.id}>
				<UserListItem user={item} channelID={channelID} />
			</div>
		);
	});
}

export default UserListVoiceChannel;
