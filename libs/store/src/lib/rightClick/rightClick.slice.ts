import { createSelector, createSlice } from '@reduxjs/toolkit';

export const RIGHT_CLICK_FEATURE_KEY = 'RIGHT_CLICK_FEATURE_KEY';

export interface RightClickState {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	rightClickXy: any;
}

export const initialRightClickState: RightClickState = {
	loadingStatus: 'not loaded',
	error: null,
	rightClickXy: {
		x: NaN,
		y: NaN,
	},
};

export const rightClickSlice = createSlice({
	name: RIGHT_CLICK_FEATURE_KEY,
	initialState: initialRightClickState,
	reducers: {
		setRightClickXy: (state, action) => {
			(state.rightClickXy = action.payload)
		},
	},
});

export const rightClickReducer = rightClickSlice.reducer;

export const rightClickAction = { ...rightClickSlice.actions };

export const getRightClickState = (rootState: { [RIGHT_CLICK_FEATURE_KEY]: RightClickState }): RightClickState => rootState[RIGHT_CLICK_FEATURE_KEY];

export const selectRightClickXy = createSelector(getRightClickState, (state: RightClickState) => state.rightClickXy);
