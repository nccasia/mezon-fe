import { clansActions, gifsActions, notificationActions } from '@mezon/store';
import { CustomLoaderFunction } from './appLoader';

export const mainLoader: CustomLoaderFunction = async ({ dispatch }) => {
	dispatch(clansActions.fetchClans());
	dispatch(notificationActions.fetchListNotification());
	dispatch(gifsActions.fetchGifCategories());
	dispatch(gifsActions.fetchGifCategoryFeatured());
	return null;
};

export const shouldRevalidateMain = () => {
	return false;
};
