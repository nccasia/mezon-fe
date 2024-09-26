import { channelsActions, overriddenPoliciesActions } from '@mezon/store';
import { ShouldRevalidateFunction } from 'react-router-dom';
import { CustomLoaderFunction } from './appLoader';

export const channelLoader: CustomLoaderFunction = async ({ params, request, dispatch }) => {
	const { channelId, clanId } = params;
	const messageId = new URL(request.url).searchParams.get('messageId');

	if (!channelId) {
		throw new Error('Channel ID null');
	}

	dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false, messageId: messageId || '' }));
	dispatch(channelsActions.setPreviousChannels({ channelId: channelId }));
	dispatch(overriddenPoliciesActions.fetchMaxChannelPermission({ clanId: clanId ?? '', channelId: channelId }));
	return null;
};

export const shouldRevalidateChannel: ShouldRevalidateFunction = (ctx) => {
	const { currentParams, nextParams, currentUrl, nextUrl } = ctx;

	const currentMessageId = new URL(currentUrl).searchParams.get('messageId');
	const nextMessageId = new URL(nextUrl).searchParams.get('messageId');

	const { channelId: currentChannelId } = currentParams;
	const { channelId: nextChannelId } = nextParams;

	return currentChannelId !== nextChannelId || currentMessageId !== nextMessageId;
};
