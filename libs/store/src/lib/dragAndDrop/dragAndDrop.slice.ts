import { createSelector, createSlice } from '@reduxjs/toolkit';

export const DRAG_AND_DROP_FEATURE_KEY = 'dragAndDrop';

export interface DragAndDropState {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	draggingState: boolean;
}

export const initialDragAndDropState: DragAndDropState = {
	loadingStatus: 'not loaded',
	error: null,
	draggingState: false
};

export const dragAndDropSlice = createSlice({
	name: DRAG_AND_DROP_FEATURE_KEY,
	initialState: initialDragAndDropState,
	reducers: {
		setDraggingState: (state, action) => {
			state.draggingState = action.payload;
		}
	}
});

export const dragAndDropReducer = dragAndDropSlice.reducer;

export const dragAndDropAction = { ...dragAndDropSlice.actions };

export const getDragAndDropState = (rootState: { [DRAG_AND_DROP_FEATURE_KEY]: DragAndDropState }): DragAndDropState =>
	rootState[DRAG_AND_DROP_FEATURE_KEY];

export const selectDragAndDropState = createSelector(getDragAndDropState, (state) => state.draggingState);
