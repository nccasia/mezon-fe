import { IMessageWithUser, IThread, LoadingStatus, sortChannelsByLastActivity, ThreadStatus, TypeCheck } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/browser';
import memoizee from 'memoizee';
import { ApiChannelDescription } from 'mezon-js/api.gen';
import { ensureSession, ensureSocket, getMezonCtx, MezonValueContext } from '../helpers';
const LIST_THREADS_CACHED_TIME = 1000 * 60 * 3;

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
	currentThread?: ApiChannelDescription;
}

export const threadsAdapter = createEntityAdapter({ selectId: (thread: ThreadsEntity) => thread.id || '' });

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
export interface FetchThreadsArgs {
	channelId: string;
	clanId: string;
	threadId?: string;
	noCache?: boolean;
}

const fetchThreadsCached = memoizee(
	async (mezon: MezonValueContext, channelId: string, clanId: string, threadId?: string) => {
		const response = await mezon.client.listThreadDescs(mezon.session, channelId, 50, 0, clanId, threadId);
		return { ...response, time: Date.now() };
	},
	{
		promise: true,
		maxAge: LIST_THREADS_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[0].session.username;
		}
	}
);

const mapToThreadEntity = (threads: ApiChannelDescription[]) => {
	return threads.map((thread) => ({
		...thread,
		id: thread.channel_id
	}));
};

export const fetchThreads = createAsyncThunk('threads/fetchThreads', async ({ channelId, clanId, noCache }: FetchThreadsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	if (noCache) {
		fetchThreadsCached.clear(mezon, channelId, clanId);
	}
	const response = await fetchThreadsCached(mezon, channelId, clanId);
	if (!response.channeldesc) {
		return [];
	}

	const threads = mapToThreadEntity(response.channeldesc);
	return threads;
});

export const fetchThread = createAsyncThunk('threads/fetchThreads', async ({ channelId, clanId, threadId, noCache }: FetchThreadsArgs, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	if (noCache) {
		fetchThreadsCached.clear(mezon, channelId, clanId, threadId);
	}
	const response = await fetchThreadsCached(mezon, channelId, clanId, threadId);
	if (!response.channeldesc) {
		return [];
	}

	const threads = mapToThreadEntity(response.channeldesc);
	return threads;
});

export const initialThreadsState: ThreadsState = threadsAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	isShowCreateThread: {},
	isPrivate: 0,
	nameValueThread: {},
	valueThread: null,
	openThreadMessageState: false
});

export const checkDuplicateThread = createAsyncThunk(
	'thread/duplicateNameCthread',
	async ({ thread_name, channel_id }: { thread_name: string; channel_id: string }, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const isDuplicateName = await mezon.socketRef.current?.checkDuplicateName(thread_name, channel_id, TypeCheck.TYPETHREAD);
			if (isDuplicateName?.type === TypeCheck.TYPETHREAD) {
				return isDuplicateName.exist;
			}
		} catch (error) {
			Sentry.captureException(error);
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const threadsSlice = createSlice({
	name: THREADS_FEATURE_KEY,
	initialState: initialThreadsState,
	reducers: {
		add: threadsAdapter.addOne,
		remove: threadsAdapter.removeOne,
		update: threadsAdapter.updateOne,

		setIsShowCreateThread: (state: ThreadsState, action: PayloadAction<{ channelId: string; isShowCreateThread: boolean }>) => {
			state.isShowCreateThread = {
				...state.isShowCreateThread,
				[action.payload.channelId]: action.payload.isShowCreateThread
			};
			state.listThreadId = {
				...state.listThreadId,
				[action.payload.channelId]: ''
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
				[action.payload.channelId]: action.payload.threadId
			};
		},
		setNameValueThread: (state, action: PayloadAction<{ channelId: string; nameValue: string }>) => {
			state.nameValueThread = {
				...state.nameValueThread,
				[action.payload.channelId]: action.payload.nameValue
			};
		},
		setOpenThreadMessageState(state, action) {
			state.openThreadMessageState = action.payload;
		},
		setCurrentThread: (state, action: PayloadAction<ApiChannelDescription>) => {
			state.currentThread = action.payload;
		},

		updateActiveCodeThread: (state: ThreadsState, action: PayloadAction<{ channelId: string; activeCode: number }>) => {
			const { channelId, activeCode } = action.payload;
			const entity = state.entities[channelId];
			if (entity) {
				threadsAdapter.updateOne(state, {
					id: channelId,
					changes: {
						active: activeCode
					}
				});
			}
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchThreads.pending, (state: ThreadsState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchThreads.fulfilled, (state: ThreadsState, action: PayloadAction<any[]>) => {
				threadsAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchThreads.rejected, (state: ThreadsState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			})
			.addCase(checkDuplicateThread.pending, (state) => {
				state.loadingStatus = 'loading';
			})
			.addCase(checkDuplicateThread.fulfilled, (state, action: PayloadAction<boolean | undefined>) => {
				state.loadingStatus = 'loaded';
				if (action.payload) {
					state.nameThreadError = 'Thread name already exists.';
				} else {
					state.nameThreadError = '';
				}
			})
			.addCase(checkDuplicateThread.rejected, (state, action) => {
				state.loadingStatus = 'error';
				state.error = action.payload as string;
			});
	}
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
export const threadsActions = { ...threadsSlice.actions, fetchThreads, fetchThread };

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

export const selectCurrentThread = createSelector(getThreadsState, (state: ThreadsState) => state.currentThread);

export const selectNameValueThread = (channelId: string) =>
	createSelector(getThreadsState, (state) => {
		return state.nameValueThread?.[channelId] as string;
	});

export const selectIsShowCreateThread = (channelId: string) =>
	createSelector(getThreadsState, (state) => {
		return state.isShowCreateThread?.[channelId] as boolean;
	});
// new update

export const selectActiveThreads = createSelector([selectAllThreads], (threads) => {
	const result = threads.filter((thread) => thread.active === ThreadStatus.activePublic);
	const sortByLsentMess = sortChannelsByLastActivity(result as any);
	return sortByLsentMess;
});

export const selectJoinedThreadsWithinLast30Days = createSelector([selectAllThreads], (threads) => {
	const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
	const currentTime = Math.floor(Date.now() / 1000);
	const result = threads.reduce((accumulator, thread) => {
		if (
			thread.active === ThreadStatus.joined &&
			thread.last_sent_message?.timestamp_seconds &&
			currentTime - Number(thread.last_sent_message.timestamp_seconds) < thirtyDaysInSeconds
		) {
			accumulator.push(thread);
		}
		return accumulator;
	}, [] as ThreadsEntity[]);
	const sortByLsentMess = sortChannelsByLastActivity(result as any);
	return sortByLsentMess;
});

export const selectThreadsOlderThan30Days = createSelector([selectAllThreads], (threads) => {
	const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
	const currentTime = Math.floor(Date.now() / 1000);
	const result = threads.reduce((accumulator, thread) => {
		if (thread.last_sent_message?.timestamp_seconds && currentTime - Number(thread.last_sent_message?.timestamp_seconds) > thirtyDaysInSeconds) {
			accumulator.push(thread);
		}
		return accumulator;
	}, [] as ThreadsEntity[]);
	const sortByLsentMess = sortChannelsByLastActivity(result as any);

	return sortByLsentMess;
});

export const selectShowEmptyStatus = () =>
	createSelector(selectAllThreads, (threads) => {
		return threads.length === 0;
	});
