import { LoadingStatus } from '@mezon/utils';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { usersClanActions } from '../clanMembers/clan.members';
import { clansActions } from '../clans/clans.slice';
import { directActions } from '../direct/direct.slice';
import { clearAllMemoizedFunctions } from '../memoize';
import { createCachedSelector, messagesActions } from '../messages/messages.slice';
import { RootState } from '../store';

export const APP_FEATURE_KEY = 'app';

interface showSettingFooterProps {
	status: boolean;
	initTab: string;
	isUserProfile?: boolean;
}

export interface AppState {
	themeApp: 'light' | 'dark' | 'system';
	loadingStatus: LoadingStatus;
	error?: string | null;
	isShowMemberList: boolean;
	isShowMemberListDM: boolean;
	isUseProfileDM: boolean;
	initialPath?: string;
	initialParams?: Record<string, string>;
	closeMenu: boolean;
	statusMenu: boolean;
	hiddenBottomTabMobile: boolean;
	hasInternetMobile: boolean;
	loadingMainMobile: boolean;
	isFromFcmMobile: boolean;
	isShowSettingFooter: showSettingFooterProps;
	isShowPopupQuickMess: boolean;
	categoryChannelOffsets: { [key: number]: number };
}

export const initialAppState: AppState = {
	loadingStatus: 'not loaded',
	themeApp: 'dark',
	isShowMemberList: true,
	isShowMemberListDM: true,
	isUseProfileDM: true,
	initialPath: '/',
	initialParams: {},
	closeMenu: false,
	statusMenu: true,
	hiddenBottomTabMobile: true,
	hasInternetMobile: false,
	loadingMainMobile: false,
	isFromFcmMobile: false,
	isShowSettingFooter: { status: false, initTab: 'Account', isUserProfile: true },
	isShowPopupQuickMess: false,
	categoryChannelOffsets: {}
};

export const refreshApp = createAsyncThunk('app/refreshApp', async (_, thunkAPI) => {
	const state = thunkAPI.getState() as RootState;

	if (!state) {
		throw Error('refresh app error: state does not init');
	}

	clearAllMemoizedFunctions();

	const isClanView = state?.clans?.currentClanId && state.clans.currentClanId !== '0';
	const currentChannelId = state.channels?.currentChannelId;
	const currentDirectId = state.direct?.currentDirectMessageId;
	const currentClanId = state.clans?.currentClanId;
	const path = window.location.pathname;

	let channelId = null;
	let clanId = null;
	if (currentChannelId && RegExp(currentChannelId).test(path)) {
		clanId = currentClanId;
		channelId = currentChannelId;
	} else if (currentDirectId && RegExp(currentDirectId).test(path)) {
		clanId = '0';
		channelId = currentDirectId;
	}

	channelId && thunkAPI.dispatch(messagesActions.fetchMessages({ clanId: clanId || '', channelId: channelId, isFetchingLatestMessages: true }));

	thunkAPI.dispatch(clansActions.fetchClans());
	if (!isClanView) {
		thunkAPI.dispatch(directActions.fetchDirectMessage({ noCache: true }));
	}

	if (isClanView && currentClanId) {
		thunkAPI.dispatch(usersClanActions.fetchUsersClan({ clanId: currentClanId }));
	}
});

export const appSlice = createSlice({
	name: APP_FEATURE_KEY,
	initialState: initialAppState,
	reducers: {
		setTheme: (state, action) => {
			state.themeApp = action.payload;
		},
		setIsShowMemberList: (state, action) => {
			state.isShowMemberList = action.payload;
		},
		toggleIsShowMemberList: (state) => {
			state.isShowMemberList = !state.isShowMemberList;
		},
		setInitialPath: (state, action) => {
			state.initialPath = action.payload;
		},
		setInitialParams: (state, action) => {
			state.initialParams = action.payload;
		},
		setCloseMenu: (state, action) => {
			state.closeMenu = action.payload;
		},
		setIsShowMemberListDM: (state, action) => {
			state.isShowMemberListDM = action.payload;
		},
		setIsUseProfileDM: (state, action) => {
			state.isUseProfileDM = action.payload;
		},
		setStatusMenu: (state, action) => {
			state.statusMenu = action.payload;
		},
		setHiddenBottomTabMobile: (state, action) => {
			state.hiddenBottomTabMobile = action.payload;
		},
		setHasInternetMobile: (state, action) => {
			state.hasInternetMobile = action.payload;
		},
		setLoadingMainMobile: (state, action) => {
			state.loadingMainMobile = action.payload;
		},
		setIsFromFCMMobile: (state, action) => {
			state.isFromFcmMobile = action.payload;
		},
		setIsShowSettingFooterStatus: (state, action) => {
			state.isShowSettingFooter = {
				...state.isShowSettingFooter,
				status: action.payload
			};
		},
		setIsShowSettingFooterInitTab: (state, action) => {
			state.isShowSettingFooter = {
				...state.isShowSettingFooter,
				initTab: action.payload
			};
		},
		setIsUserProfile: (state, action) => {
			state.isShowSettingFooter = {
				...state.isShowSettingFooter,
				isUserProfile: action.payload
			};
		},
		setIsShowPopupQuickMess: (state, action) => {
			state.isShowPopupQuickMess = action.payload;
		},
		setCategoryChannelOffsets: (state, action) => {
			state.categoryChannelOffsets = {
				...state.categoryChannelOffsets,
				...action.payload
			};
		}
	}
});

/*
 * Export reducer for store configuration.
 */
export const appReducer = appSlice.reducer;

export const appActions = { ...appSlice.actions, refreshApp };

export const getAppState = (rootState: { [APP_FEATURE_KEY]: AppState }): AppState => rootState[APP_FEATURE_KEY];

export const selectAllApp = createSelector(getAppState, (state: AppState) => state);

export const selectTheme = createSelector(getAppState, (state: AppState) => state.themeApp || 'dark');

export const selectError = createSelector(getAppState, (state: AppState) => state.error);

export const selectIsShowMemberList = createSelector(getAppState, (state: AppState) => state.isShowMemberList);

export const selectInitialPath = createCachedSelector(getAppState, (state: AppState) => state.initialPath);

export const selectInitialParams = createCachedSelector(getAppState, (state: AppState) => state.initialParams);

export const selectCloseMenu = createSelector(getAppState, (state: AppState) => state.closeMenu);

export const selectIsShowMemberListDM = createSelector(getAppState, (state: AppState) => state.isShowMemberListDM);

export const selectIsUseProfileDM = createSelector(getAppState, (state: AppState) => state.isUseProfileDM);

export const selectStatusMenu = createSelector(getAppState, (state: AppState) => state.statusMenu);

export const selectHiddenBottomTabMobile = createSelector(getAppState, (state: AppState) => state.hiddenBottomTabMobile);

export const selectHasInternetMobile = createSelector(getAppState, (state: AppState) => state.hasInternetMobile);

export const selectLoadingMainMobile = createSelector(getAppState, (state: AppState) => state.loadingMainMobile);

export const selectIsFromFCMMobile = createSelector(getAppState, (state: AppState) => state.isFromFcmMobile);

export const selectIsShowSettingFooter = createSelector(getAppState, (state: AppState) => state.isShowSettingFooter);

export const selectIsShowPopupQuickMess = createSelector(getAppState, (state: AppState) => state.isShowPopupQuickMess);

export const selectCategoryChannelOffsets = createSelector(getAppState, (state: AppState) => state.categoryChannelOffsets);
