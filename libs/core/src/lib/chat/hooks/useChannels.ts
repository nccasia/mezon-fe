import { ChannelsEntity, selectAllChannels } from '@mezon/store';
import { ChannelThreads } from '@mezon/utils';
import React from 'react';
import { useSelector } from 'react-redux';

export function useChannels() {
	const channels = useSelector(selectAllChannels);

	const channelFilter = React.useMemo(() => channels.filter((channel) => channel.parrent_id === '0' || channel.parrent_id === ''), [channels]);
	const listChannels = React.useMemo(() => {
		const channelThread = channelFilter.map((channel) => {
			const thread = channels.filter((thread) => channel && channel?.channel_id === thread.parrent_id) as ChannelsEntity[];
			return {
				...channel,
				threads: thread
			};
		});
		return channelThread as ChannelThreads[];
	}, [channelFilter, channels]);

	return React.useMemo(
		() => ({
			channels,
			listChannels
		}),
		[channels, listChannels]
	);
}
