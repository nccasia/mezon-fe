import { MezonContextValue } from '@mezon/transport';
import { ThunkDispatch, UnknownAction, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { accountReducer } from './account/account.slice';
import { appReducer } from './app/app.slice';
import { authReducer } from './auth/auth.slice';
import { categoriesReducer } from './categories/categories.slice';
import { channelMembersReducer } from './channelmembers/channel.members';
import { channelsReducer } from './channels/channels.slice';
import { usersClanReducer } from './clanMembers/clan.members';
import { userClanProfileReducer } from './clanProfile/clanProfile.slice';
import { clansReducer } from './clans/clans.slice';
import { directReducer } from './direct/direct.slice';
import { emojiSuggestionReducer } from './emojiSuggestion/emojiSuggestion.slice';
import { friendsReducer } from './friends/friend.slice';
import { gifsReducer } from './giftStickerEmojiPanel/gifs.slice';
import { gifsStickerEmojiReducer } from './giftStickerEmojiPanel/gifsStickerEmoji.slice';
import { stickersReducer } from './giftStickerEmojiPanel/stickers.slice';
import { inviteReducer } from './invite/invite.slice';
import { messagesReducer } from './messages/messages.slice';
import { referencesReducer } from './messages/references.slice';
import { notificationReducer } from './notification/notify.slice';
import { POLICIES_FEATURE_KEY, policiesDefaultReducer, policiesReducer } from './policies/policies.slice';
import { reactionReducer } from './reactionMessage/reactionMessage.slice';

import { attachmentReducer } from './attachment/attachments.slice';
import { dragAndDropReducer } from './dragAndDrop/dragAndDrop.slice';
import { errorListenerMiddleware } from './errors/errors.listener';
import { ERRORS_FEATURE_KEY, errorsReducer } from './errors/errors.slice';
import { eventManagementReducer } from './eventManagement/eventManagement.slice';
import { popupForwardReducer } from './forwardMessage/forwardMessage.slice';
import { notifiReactMessageReducer } from './notificationSetting/notificationReactMessage.slice';
import { channelCategorySettingReducer, defaultNotificationCategoryReducer } from './notificationSetting/notificationSettingCategory.slice';
import { notificationSettingReducer } from './notificationSetting/notificationSettingChannel.slice';
import { defaultNotificationClanReducer } from './notificationSetting/notificationSettingClan.slice';
import { pinMessageReducer } from './pinMessages/pinMessage.slice';
import { rightClickReducer } from './rightClick/rightClick.slice';
import { IsShowReducer, RolesClanReducer, roleIdReducer } from './roleclan/roleclan.slice';
import { SEARCH_MESSAGES_FEATURE_KEY, searchMessageReducer } from './searchmessages/searchmessage.slice';
import { threadsReducer } from './threads/threads.slice';
import { toastListenerMiddleware } from './toasts/toasts.listener';
import { TOASTS_FEATURE_KEY, toastsReducer } from './toasts/toasts.slice';
import { usersReducer } from './users/users.slice';
import { voiceReducer } from './voice/voice.slice';

const persistedReducer = persistReducer(
	{
		key: 'auth',
		storage,
	},
	authReducer,
);

const persistedClansReducer = persistReducer(
	{
		key: 'clans',
		storage,
	},
	clansReducer,
);

const persistedAppReducer = persistReducer(
	{
		key: 'apps',
		storage,
	},
	appReducer,
);

const reducer = {
	app: persistedAppReducer,
	account: accountReducer,
	auth: persistedReducer,
	attachments: attachmentReducer,
	clans: persistedClansReducer,
	channels: channelsReducer,
	channelMembers: channelMembersReducer,
	threads: threadsReducer,
	[SEARCH_MESSAGES_FEATURE_KEY]: searchMessageReducer,
	messages: messagesReducer,
	users: usersReducer,
	categories: categoriesReducer,
	rolesclan: RolesClanReducer,
	eventmanagement: eventManagementReducer,
	usersClan: usersClanReducer,
	[POLICIES_FEATURE_KEY]: policiesReducer,
	userClanProfile: userClanProfileReducer,
	friends: friendsReducer,
	direct: directReducer,
	roleId: roleIdReducer,
	policiesDefaultSlice: policiesDefaultReducer,
	notificationsetting: notificationSettingReducer,
	pinmessages: pinMessageReducer,
	defaultnotificationclan: defaultNotificationClanReducer,
	defaultnotificationcategory: defaultNotificationCategoryReducer,
	notichannelcategorysetting: channelCategorySettingReducer,
	notifireactmessage: notifiReactMessageReducer,
	invite: inviteReducer,
	isshow: IsShowReducer,
	forwardmessage: popupForwardReducer,
	notification: notificationReducer,
	voice: voiceReducer,
	references: referencesReducer,
	reaction: reactionReducer,
	suggestionEmoji: emojiSuggestionReducer,
	gifs: gifsReducer,
	stickers: stickersReducer,
	gifsStickersEmojis: gifsStickerEmojiReducer,
	dragAndDrop: dragAndDropReducer,
	rightClick: rightClickReducer,
	[ERRORS_FEATURE_KEY]: errorsReducer,
	[TOASTS_FEATURE_KEY]: toastsReducer,
};

let storeInstance = configureStore({
	reducer,
});

let storeCreated = false;

export type RootState = ReturnType<typeof storeInstance.getState>;

export type PreloadedRootState = RootState | undefined;

export const initStore = (mezon: MezonContextValue, preloadedState?: PreloadedRootState) => {
	const store = configureStore({
		reducer,
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				thunk: {
					extraArgument: {
						mezon,
					},
				},
				immutableCheck: false,
				serializableCheck: false,
			}).prepend(errorListenerMiddleware.middleware, toastListenerMiddleware.middleware),
	});
	storeInstance = store;
	storeCreated = true;
	const persistor = persistStore(store);
	return { store, persistor };
};

export type Store = typeof storeInstance;

export type AppThunkDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

export type AppDispatch = typeof storeInstance.dispatch & AppThunkDispatch;

export const getStore = () => {
	return storeInstance;
};

export const getStoreAsync = async () => {
	if (!storeCreated) {
		return new Promise<Store>((resolve) => {
			const interval = setInterval(() => {
				if (storeCreated) {
					clearInterval(interval);
					resolve(storeInstance);
				}
			}, 100);
		});
	}
	return storeInstance;
};

export const useAppDispatch = () => useDispatch<AppDispatch>();
