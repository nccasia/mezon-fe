import { clansActions, friendsActions } from '@mezon/store';
import { CustomLoaderFunction } from './appLoader';

export const friendsLoader: CustomLoaderFunction = async ({ dispatch }) => {
	dispatch(clansActions.joinClan({ clanId: '0' }));
	dispatch(friendsActions.fetchListFriends({}));
	return null;
};
