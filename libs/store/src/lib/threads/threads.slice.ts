import { IMessageWithUser, IThread, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

export const THREADS_FEATURE_KEY = 'threads';

/*
 * Update these interfaces according to your requirements.
 */
export interface ThreadsEntity extends IThread {
	id: string; // Primary ID
}

export interface ThreadsState extends EntityState<ThreadsEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	isShowCreateThread?: Record<string, boolean>;
	nameThreadError?: string;
	messageThreadError?: string;
	isPrivate: number;
	listThreadId?: Record<string, string>;
	nameValueThread?: Record<string, string>;
	valueThread: IMessageWithUser | null;
	openThreadMessageState: boolean;
}

export const threadsAdapter = createEntityAdapter<ThreadsEntity>();

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
 *   dispatch(fetchThreads())
 * }, [dispatch]);
 * ```
 */
export const fetchThreads = createAsyncThunk<ThreadsEntity[]>('threads/fetchStatus', async (_, thunkAPI) => {
	/**
	 * Replace this with your custom fetch call.
	 * For example, `return myApi.getThreadss()`;
	 * Right now we just return an empty array.
	 */
	return Promise.resolve([]);
});

export const initialThreadsState: ThreadsState = threadsAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	isShowCreateThread: {},
	isPrivate: 0,
	nameValueThread: {},
	valueThread: null,
	openThreadMessageState: false,
});

export const threadsSlice = createSlice({
	name: THREADS_FEATURE_KEY,
	initialState: initialThreadsState,
	reducers: {
		add: threadsAdapter.addOne,
		remove: threadsAdapter.removeOne,
		setIsShowCreateThread: (state: ThreadsState, action: PayloadAction<{ channelId: string; isShowCreateThread: boolean }>) => {
			state.isShowCreateThread = {
				...state.isShowCreateThread,
				[action.payload.channelId]: action.payload.isShowCreateThread,
			};
			state.listThreadId = {
				...state.listThreadId,
				[action.payload.channelId]: '',
			};
		},
		setNameThreadError: (state, action: PayloadAction<string>) => {
			state.nameThreadError = action.payload;
		},
		setValueThread: (state, action: PayloadAction<IMessageWithUser | null>) => {
			state.valueThread = action.payload;
		},
		setMessageThreadError: (state, action: PayloadAction<string>) => {
			state.messageThreadError = action.payload;
		},
		setIsPrivate: (state, action: PayloadAction<number>) => {
			state.isPrivate = action.payload;
		},
		setListThreadId: (state, action: PayloadAction<{ channelId: string; threadId: string }>) => {
			state.listThreadId = {
				...state.listThreadId,
				[action.payload.channelId]: action.payload.threadId,
			};
		},
		setNameValueThread: (state, action: PayloadAction<{ channelId: string; nameValue: string }>) => {
			state.nameValueThread = {
				...state.nameValueThread,
				[action.payload.channelId]: action.payload.nameValue,
			};
		},
		setOpenThreadMessageState(state, action) {
			state.openThreadMessageState = action.payload;
		},
		// ...
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchThreads.pending, (state: ThreadsState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchThreads.fulfilled, (state: ThreadsState, action: PayloadAction<ThreadsEntity[]>) => {
				threadsAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchThreads.rejected, (state: ThreadsState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const threadsReducer = threadsSlice.reducer;

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
 *   dispatch(threadsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const threadsActions = { ...threadsSlice.actions };

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllThreads);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = threadsAdapter.getSelectors();

export const getThreadsState = (rootState: { [THREADS_FEATURE_KEY]: ThreadsState }): ThreadsState => rootState[THREADS_FEATURE_KEY];

export const selectAllThreads = createSelector(getThreadsState, selectAll);

export const selectThreadsEntities = createSelector(getThreadsState, selectEntities);

export const selectIsPrivate = createSelector(getThreadsState, (state) => state.isPrivate);

export const selectNameThreadError = createSelector(getThreadsState, (state) => state.nameThreadError);

export const selectMessageThreadError = createSelector(getThreadsState, (state) => state.messageThreadError);

export const selectListThreadId = createSelector(getThreadsState, (state) => state.listThreadId);

export const selectValueThread = createSelector(getThreadsState, (state) => state.valueThread);

export const selectOpenThreadMessageState = createSelector(getThreadsState, (state: ThreadsState) => state.openThreadMessageState);

export const selectNameValueThread = (channelId: string) =>
	createSelector(getThreadsState, (state) => {
		return state.nameValueThread?.[channelId] as string;
	});

export const selectIsShowCreateThread = (channelId: string) =>
	createSelector(getThreadsState, (state) => {
		return state.isShowCreateThread?.[channelId] as boolean;
	});
