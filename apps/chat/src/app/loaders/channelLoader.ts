import { channelsActions, getStoreAsync } from '@mezon/store';
import { LoaderFunction, ShouldRevalidateFunction } from 'react-router-dom';

export const channelLoader: LoaderFunction = async ({ params, request }) => {
	const { channelId, clanId } = params;
	// const messageId = new URL(request.url).searchParams.get('messageId');

	const store = await getStoreAsync();
	if (!channelId) {
		throw new Error('Channel ID null');
	}

	// console.log("messageId", messageId);
	// if (messageId) {
	// 	setJumpToMessageId(messageId);
	// }

	// store.dispatch(messagesActions.jumpToMessage({ messageId: messageId ?? '', channelId: channelId }));
	store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	return null;
};

export const shouldRevalidateChannel: ShouldRevalidateFunction = (ctx) => {
	const { currentParams, nextParams } = ctx;
	const { channelId: currentChannelId } = currentParams;
	const { channelId: nextChannelId } = nextParams;

	return currentChannelId !== nextChannelId;
};
