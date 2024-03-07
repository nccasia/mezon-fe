import { directActions, getStoreAsync } from '@mezon/store';
import { ChannelTypeEnum } from '@mezon/utils';
import { LoaderFunction } from 'react-router-dom';

export const directLoader: LoaderFunction = async () => {
	const store = await getStoreAsync();
	store.dispatch(
		directActions.fetchDirectMessage({}),
	);

	return null;
};
