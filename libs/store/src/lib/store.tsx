import { MezonContextValue } from '@mezon/transport';
import { trackActionError } from '@mezon/utils';
import { ThunkDispatch, UnknownAction, configureStore } from '@reduxjs/toolkit';
import React from 'react';
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
import { emojisReducer } from './emoji/emoji.slice';
import { friendsReducer } from './friends/friend.slice';
import { inviteReducer } from './invite/invite.slice';
import { messagesReducer } from './messages/messages.slice';
import { notificationReducer } from './notification/notify.slice';
import { POLICIES_FEATURE_KEY, policiesDefaultReducer, policiesReducer } from './policies/policies.slice';
import { IsShowReducer, RolesClanReducer, roleIdReducer } from './roleclan/roleclan.slice';
import { threadsReducer } from './threads/threads.slice';
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
	clans: persistedClansReducer,
	channels: channelsReducer,
	channelMembers: channelMembersReducer,
	threads: threadsReducer,
	messages: messagesReducer,
	users: usersReducer,
	categories: categoriesReducer,
	rolesclan: RolesClanReducer,
	usersClan: usersClanReducer,
	// membersRole: MembersRoleReducer,
	[POLICIES_FEATURE_KEY]: policiesReducer,
	userClanProfile: userClanProfileReducer,
	friends: friendsReducer,
	direct: directReducer,
	roleId: roleIdReducer,
	policiesDefaultSlice: policiesDefaultReducer,
	invite: inviteReducer,
	isshow: IsShowReducer,
	notification: notificationReducer,
	voice: voiceReducer,
	emojis: emojisReducer,
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
