import { LoadingStatus } from '@mezon/utils';
import { createSelector, createSlice } from '@reduxjs/toolkit';

export const APP_FEATURE_KEY = 'app';

export interface AppState {
	themeApp: 'light' | 'dark' | 'system';
	loadingStatus: LoadingStatus;
	error?: string | null;
	isShowMemberList: boolean;
	isShowMemberListDM: boolean;
	isUseProfileDM: boolean;
	initialPath?: string;
	closeMenu: boolean;
	statusMenu: boolean;
	hiddenBottomTabMobile: boolean;
	hasInternetMobile: boolean;
	loadingMainMobile: boolean;
	isFromFcmMobile: boolean;
}

export const initialAppState: AppState = {
	loadingStatus: 'not loaded',
	themeApp: 'dark',
	isShowMemberList: true,
	isShowMemberListDM: true,
	isUseProfileDM: true,
	initialPath: '/',
	closeMenu: false,
	statusMenu: true,
	hiddenBottomTabMobile: true,
	hasInternetMobile: false,
	loadingMainMobile: false,
	isFromFcmMobile: false,
};

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
	},
});

/*
 * Export reducer for store configuration.
 */
export const appReducer = appSlice.reducer;

export const appActions = appSlice.actions;

export const getAppState = (rootState: { [APP_FEATURE_KEY]: AppState }): AppState => rootState[APP_FEATURE_KEY];

export const selectAllApp = createSelector(getAppState, (state: AppState) => state);

export const selectTheme = createSelector(getAppState, (state: AppState) => state.themeApp);

export const selectError = createSelector(getAppState, (state: AppState) => state.error);

export const selectIsShowMemberList = createSelector(getAppState, (state: AppState) => state.isShowMemberList);

export const selectInitialPath = createSelector(getAppState, (state: AppState) => state.initialPath);

export const selectCloseMenu = createSelector(getAppState, (state: AppState) => state.closeMenu);

export const selectIsShowMemberListDM = createSelector(getAppState, (state: AppState) => state.isShowMemberListDM);

export const selectIsUseProfileDM = createSelector(getAppState, (state: AppState) => state.isUseProfileDM);

export const selectStatusMenu = createSelector(getAppState, (state: AppState) => state.statusMenu);

export const selectHiddenBottomTabMobile = createSelector(getAppState, (state: AppState) => state.hiddenBottomTabMobile);

export const selectHasInternetMobile = createSelector(getAppState, (state: AppState) => state.hasInternetMobile);

export const selectLoadingMainMobile = createSelector(getAppState, (state: AppState) => state.loadingMainMobile);

export const selectIsFromFCMMobile = createSelector(getAppState, (state: AppState) => state.isFromFcmMobile);
