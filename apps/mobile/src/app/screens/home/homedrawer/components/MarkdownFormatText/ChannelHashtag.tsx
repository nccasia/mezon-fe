import { getChannelHashtag } from '@mezon/mobile-components';
import { ChannelsEntity, HashtagDmEntity } from '@mezon/store';
import { ChannelType } from 'mezon-js';

type IChannelHashtag = {
	channelHashtagId: string;
	channelsEntities?: Record<string, ChannelsEntity>;
	hashtagDmEntities?: Record<string, HashtagDmEntity>;
	directMessageId?: string;
	mode?: number;
};
export const ChannelHashtag = ({ channelHashtagId, channelsEntities, hashtagDmEntities, directMessageId, mode }: IChannelHashtag) => {
	const getChannelById = (channelHashtagId: string): ChannelsEntity => {
    const channel = getChannelHashtag(directMessageId, hashtagDmEntities, channelHashtagId, channelsEntities, mode);
		if (channel) {
			return channel;
		}

		return {
			id: channelHashtagId,
			channel_label: 'unknown',
		};
	};

	const channel = getChannelById(channelHashtagId);

	const dataPress = `${channel.type}_${channel.channel_id}_${channel.clan_id}_${channel.status}_${channel.meeting_code}`;

	if (channel.type === ChannelType.CHANNEL_TYPE_VOICE) {
		return `[${channel.channel_label}](##voice${JSON.stringify(dataPress)})`;
	}
	return channel['channel_id']
		? `[#${channel.channel_label}](#${JSON.stringify(dataPress)})`
		: `[\\# ${channel.channel_label}](#${JSON.stringify(dataPress)})`;
};
