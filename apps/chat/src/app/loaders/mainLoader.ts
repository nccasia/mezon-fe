import { clansActions, getStoreAsync, notificationActions } from '@mezon/store';
import { gifsActions } from 'libs/store/src/lib/giftStickerEmojiPanel/gifs.slice';

export const mainLoader = async () => {
	const store = await getStoreAsync();
	store.dispatch(clansActions.fetchClans());
	store.dispatch(notificationActions.fetchListNotification());
	store.dispatch(gifsActions.fetchGifCategories());
	store.dispatch(gifsActions.fetchGifCategoryFeatured());

	return null;
};

export const shouldRevalidateMain = () => {
	return false;
};
