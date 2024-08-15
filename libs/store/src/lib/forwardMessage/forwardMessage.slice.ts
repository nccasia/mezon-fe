import { IMessageWithUser } from '@mezon/utils';
import {createSelector, createSlice} from '@reduxjs/toolkit';
import { RootState } from '../store';
export const popupForwardSlice = createSlice({
	name: 'forwardmessage',
	initialState: {
		openPopupForward: false,
		message: {} as IMessageWithUser,
		isForwardAll: false,
	},
	reducers: {
		toggleIsShowPopupForwardTrue: (state) => {
			state.openPopupForward = true;
		},
		toggleIsShowPopupForwardFalse: (state) => {
			state.openPopupForward = false;
		},
		setSelectedMessage: (state, action) => {
			state.message = action.payload;
		},
		setIsForwardAll: (state, action) => {
			state.isForwardAll = action.payload;
		}
	},
});

export const popupForwardReducer = popupForwardSlice.reducer;

export const getIsShowPopupForward = (state: RootState) => state.forwardmessage.openPopupForward;
export const getSelectedMessage = (state: RootState) => state.forwardmessage.message;

export const getIsFowardAll = (state: RootState) => state.forwardmessage.isForwardAll;

export const { toggleIsShowPopupForwardTrue, toggleIsShowPopupForwardFalse, setSelectedMessage, setIsForwardAll } = popupForwardSlice.actions;
