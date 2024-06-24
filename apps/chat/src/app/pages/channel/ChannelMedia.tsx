import { ChannelVoice, ChannelVoiceOff } from '@mezon/components';
import { ChannelsEntity } from '@mezon/store-mobile';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import ChannelMessages from './ChannelMessages';

type ChannelMediaProps = {
	currentChannel: ChannelsEntity | null;
	statusCall: boolean;
};

export const ChannelMedia = ({ currentChannel, statusCall }: ChannelMediaProps) => {
	if (currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT) {
		return (
			<ChannelMessages
				channelId={currentChannel?.id}
				channelLabel={currentChannel.channel_label}
				type="CHANNEL"
				mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
			/>
		);
	}
	if (currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
		return statusCall ? <ChannelVoice channelId={currentChannel.channel_id || ''} /> : <ChannelVoiceOff />;
	}
	return <ChannelMessages.Skeleton />;
};
