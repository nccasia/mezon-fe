import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export const CANVAS_FEATURE_KEY = 'canvas';

export interface CanvasState {
	title: string;
	content: string;
	idCanvas: string | null;
}

const initialState: CanvasState = {
	title: '',
	content: '',
	idCanvas: null
};

const canvasSlice = createSlice({
	name: 'canvas',
	initialState,
	reducers: {
		setTitle: (state, action: PayloadAction<string>) => {
			state.title = action.payload;
		},
		setContent: (state, action: PayloadAction<string>) => {
			state.content = action.payload;
		},
		setIdCanvas: (state, action: PayloadAction<string | null>) => {
			state.idCanvas = action.payload;
		}
	}
});

export const canvasReducer = canvasSlice.reducer;

export const canvasActions = {
	...canvasSlice.actions
};

export const getCanvasState = (rootState: { [CANVAS_FEATURE_KEY]: CanvasState }): CanvasState => rootState[CANVAS_FEATURE_KEY];

export const selectTitle = createSelector(getCanvasState, (state) => state.title);

export const selectContent = createSelector(getCanvasState, (state) => state.content);

export const selectIdCanvas = createSelector(getCanvasState, (state) => state.idCanvas);