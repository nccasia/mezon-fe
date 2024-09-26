import { channelsActions, directActions } from '@mezon/store';
import { CustomLoaderFunction } from './appLoader';

export const directMessageLoader: CustomLoaderFunction = async ({ params, dispatch }) => {
	const { directId, type } = params;
	if (!directId) {
		throw new Error('DirectMessage ID null');
	}

	dispatch(
		directActions.joinDirectMessage({
			directMessageId: directId,
			channelName: '',
			type: Number(type)
		})
	);
	dispatch(channelsActions.setPreviousChannels({ channelId: directId }));

	return null;
};
