import { MezonContextValue } from '@mezon/transport';
import { trackActionError } from '@mezon/utils';
import { ThunkDispatch, UnknownAction, configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useDispatch } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import { reduxPersistStorage as storage } from '@mezon/mobile-components';

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
import { popupForwardReducer } from './forwardMessage/forwardMessage.slice';
import { IsShowReducer, RolesClanReducer, roleIdReducer } from './roleclan/roleclan.slice';
import { threadsReducer } from './threads/threads.slice';
import { usersReducer } from './users/users.slice';
import { voiceReducer } from './voice/voice.slice';
import { eventManagementReducer } from './eventManagement/eventManagement.slice';
import { channelCategorySettingReducer, defaultNotificationCategoryReducer } from './notificationSetting/notificationSettingCategory.slice';
import { defaultNotificationClanReducer } from './notificationSetting/notificationSettingClan.slice';
import { notificationSettingReducer } from './notificationSetting/notificationSettingChannel.slice';
import { notifiReactMessageReducer } from './notificationSetting/notificationReactMessage.slice';

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
	messages: messagesReducer,
	users: usersReducer,
	categories: categoriesReducer,
	rolesclan: RolesClanReducer,
	eventmanagement: eventManagementReducer,
	usersClan: usersClanReducer,
	// membersRole: MembersRoleReducer,
	[POLICIES_FEATURE_KEY]: policiesReducer,
	userClanProfile: userClanProfileReducer,
	friends: friendsReducer,
	direct: directReducer,
	roleId: roleIdReducer,
	policiesDefaultSlice: policiesDefaultReducer,
	notificationsetting: notificationSettingReducer,
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
				serializableCheck: false,
			}),
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

export function useAppDispatch(): AppDispatch {
	const dispatch = useDispatch<AppDispatch>();
	const dispatchRef = React.useRef(dispatch);

	const appDispatch: typeof dispatch = React.useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(action: any) => {
			const result = dispatchRef.current(action);
			if (result instanceof Promise) {
				return result.then((res) => {
					trackActionError(res);
					return res;
				});
			}
			trackActionError(result);
			return result;
		},
		[],
	);

	return appDispatch;
}
