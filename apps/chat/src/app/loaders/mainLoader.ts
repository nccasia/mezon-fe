import { clansActions, getStoreAsync, notificationActions } from '@mezon/store';

export const mainLoader = async () => {
	const store = await getStoreAsync();
	store.dispatch(clansActions.fetchClans());
	store.dispatch(notificationActions.fetchListNotification());
	store.dispatch(notificationActions.fetchNotifyMention());
	return null;
};

export const shouldRevalidateMain = () => {
	return false;
};
