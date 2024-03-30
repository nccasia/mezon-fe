import { IUser, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

export const USERS_FEATURE_KEY = 'users';

/*
 * Update these interfaces according to your requirements.
 */
export interface UsersEntity extends IUser {
	id: string; // Primary ID
}

export interface UsersState extends EntityState<UsersEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
}

export const usersAdapter = createEntityAdapter<UsersEntity>();

/**
 * Export an effect using createAsyncThunk from
 * the Redux Toolkit: https://redux-toolkit.js.org/api/createAsyncThunk
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(fetchUsers())
 * }, [dispatch]);
 * ```
 */
export const fetchUsers = createAsyncThunk<UsersEntity[]>('users/fetchStatus', async (_, thunkAPI) => {
	/**
	 * Replace this with your custom fetch call.
	 * For example, `return myApi.getUserss()`;
	 * Right now we just return an empty array.
	 */
	return Promise.resolve([]);
});

export const initialUsersState: UsersState = usersAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
});

export const usersSlice = createSlice({
	name: USERS_FEATURE_KEY,
	initialState: initialUsersState,
	reducers: {
		add: usersAdapter.addOne,
		remove: usersAdapter.removeOne,
		// ...
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUsers.pending, (state: UsersState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchUsers.fulfilled, (state: UsersState, action: PayloadAction<UsersEntity[]>) => {
				usersAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchUsers.rejected, (state: UsersState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const usersReducer = usersSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(usersActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const usersActions = usersSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllUsers);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */

const { selectAll, selectEntities } = usersAdapter.getSelectors();

export const getUsersState = (rootState: { [USERS_FEATURE_KEY]: UsersState }): UsersState => rootState[USERS_FEATURE_KEY];

export const selectAllUsers = createSelector(getUsersState, selectAll);

export const selectUsersEntities = createSelector(getUsersState, selectEntities);
