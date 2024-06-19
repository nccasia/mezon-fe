import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ErrorState {
	errors: string[];
}

export const ERRORS_FEATURE_KEY = 'errors';

export const initialErrorState: ErrorState = {
	errors: [],
};

export type ErrorPayload = {
  message?: string;
}

export type ErrorAction = PayloadAction<ErrorPayload>;

export const errorsSlice = createSlice({
	name: 'errors',
	initialState: initialErrorState,
	reducers: {
		addError: (state, action: PayloadAction<string>) => {
			state.errors.push(action.payload);
		},
		removeError: (state, action: PayloadAction<number>) => {
			state.errors.splice(action.payload, 1);
		},
		clearErrors: (state) => {
			state.errors = [];
		},
	},
});

export const { addError, removeError, clearErrors } = errorsSlice.actions;

export const selectErrors = (state: { errors: ErrorState }) => state.errors.errors;

export const errorsReducer = errorsSlice.reducer;
