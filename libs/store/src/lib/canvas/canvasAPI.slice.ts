import { CanvasUpdate, ICanvas, LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiEditChannelCanvasRequest } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';

export const CANVAS_API_FEATURE_KEY = 'canvasapi';

/*
 * Update these interfaces according to your requirements.
 */
export interface CanvasAPIEntity extends ICanvas {
	id: string; // Primary ID
}

export interface CanvasAPIState {
	loadingStatus: LoadingStatus;
	error?: string | null;
	channelCanvas: Record<
		string,
		EntityState<CanvasAPIEntity, string> & {
			id: string;
		}
	>;
}

export const canvasAPIAdapter = createEntityAdapter({
	selectId: (canvas: CanvasAPIEntity) => canvas.id || ''
});

const emptyObject = {};

type getCanvasDetailPayload = {
	id: string;
	clan_id: string;
	channel_id: string;
};

type getCanvasListPayload = {
	channel_id: string;
	clan_id: string;
	limit?: number;
	page?: number;
};

export const createEditCanvas = createAsyncThunk('canvas/editChannelCanvases', async (body: ApiEditChannelCanvasRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		const response = await mezon.client.editChannelCanvases(mezon.session, body);

		return { ...response, channel_id: body.channel_id, title: body.title, content: body.content };
	} catch (error: any) {
		const errstream = await error.json();
		return thunkAPI.rejectWithValue(errstream.message);
	}
});

export const getChannelCanvasDetail = createAsyncThunk(
	'canvas/getChannelCanvasDetail',
	async ({ id, clan_id, channel_id }: getCanvasDetailPayload, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.getChannelCanvasDetail(mezon.session, id, clan_id, channel_id);
			return response;
		} catch (error: any) {
			const errstream = await error.json();
			return thunkAPI.rejectWithValue(errstream.message);
		}
	}
);

export const getChannelCanvasList = createAsyncThunk(
	'canvas/getChannelCanvasList',
	async ({ channel_id, clan_id, limit, page }: getCanvasListPayload, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));

			const response = await mezon.client.getChannelCanvasList(mezon.session, channel_id, clan_id, limit, page);
			return response;
		} catch (error: any) {
			const errstream = await error.json();
			return thunkAPI.rejectWithValue(errstream.message);
		}
	}
);

export const initialCanvasAPIState: CanvasAPIState = canvasAPIAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	channelCanvas: {}
});

const handleSetManyCanvas = ({
	state,
	channelId,
	adapterPayload
}: {
	state: CanvasAPIState;
	channelId?: string;
	adapterPayload: CanvasAPIEntity[];
}) => {
	if (!channelId) return;
	if (!state.channelCanvas[channelId]) {
		state.channelCanvas[channelId] = canvasAPIAdapter.getInitialState({
			id: channelId
		});
	}

	const updatedChannelCanvas = canvasAPIAdapter.setMany(state.channelCanvas[channelId], adapterPayload);
	state.channelCanvas[channelId] = updatedChannelCanvas;
};

export const canvasAPISlice = createSlice({
	name: CANVAS_API_FEATURE_KEY,
	initialState: initialCanvasAPIState,
	reducers: {
		// ...
		updateCanvas: (state, action: PayloadAction<{ channelId: string; dataUpdate: CanvasUpdate }>) => {
			const { channelId, dataUpdate } = action.payload;
			const { id, title, content, creator_id } = dataUpdate;
			canvasAPIAdapter.updateOne(state.channelCanvas[channelId], {
				id: id,
				changes: {
					title: title,
					content: content,
					creator_id: creator_id
				}
			});
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(createEditCanvas.pending, (state: CanvasAPIState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(createEditCanvas.fulfilled, (state: CanvasAPIState, action: PayloadAction<any>) => {
				state.loadingStatus = 'loaded';
				const { channel_id } = action.payload;
				canvasAPIAdapter.upsertOne(state.channelCanvas[channel_id], action.payload);
			})
			.addCase(createEditCanvas.rejected, (state: CanvasAPIState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
		builder
			.addCase(getChannelCanvasList.pending, (state: CanvasAPIState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(getChannelCanvasList.fulfilled, (state: CanvasAPIState, action: PayloadAction<any>) => {
				state.loadingStatus = 'loaded';
				const channelId = (action as any)?.meta?.arg?.channel_id;
				const reversedCanvas = action.payload.channel_canvases;
				handleSetManyCanvas({
					state,
					channelId,
					adapterPayload: reversedCanvas
				});
			})
			.addCase(getChannelCanvasList.rejected, (state: CanvasAPIState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
		builder
			.addCase(getChannelCanvasDetail.pending, (state: CanvasAPIState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(getChannelCanvasDetail.fulfilled, (state: CanvasAPIState, action: PayloadAction<any>) => {
				state.loadingStatus = 'loaded';
			})
			.addCase(getChannelCanvasDetail.rejected, (state: CanvasAPIState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
});

/*
 * Export reducer for store configuration.
 */
export const canvasAPIReducer = canvasAPISlice.reducer;

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
export const canvasAPIActions = {
	...canvasAPISlice.actions,
	createEditCanvas,
	getChannelCanvasList,
	getChannelCanvasDetail
};

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

export const getCanvasApiState = (rootState: { [CANVAS_API_FEATURE_KEY]: CanvasAPIState }): CanvasAPIState => rootState[CANVAS_API_FEATURE_KEY];

export const getChannelIdCanvasAsSecondParam = (_: unknown, channelId: string) => channelId;

export const selectAllCanvas = createSelector(getCanvasApiState, (canvasState) => {
	const res: CanvasAPIEntity[] = [];
	Object.values(canvasState.channelCanvas || {}).forEach((item) => {
		res.concat(Object.values(item?.entities || {}));
	});
	return res;
});

export const selectCanvasIdsByChannelId = createSelector([getCanvasApiState, getChannelIdCanvasAsSecondParam], (state, channelId) => {
	return state?.channelCanvas[channelId]?.ids || [];
});

export const selectCanvasEntityById = createSelector(
	[getCanvasApiState, getChannelIdCanvasAsSecondParam, (_, __, canvasId) => canvasId],
	(canvasState, channelId, canvasId) => {
		return canvasState.channelCanvas[channelId]?.entities?.[canvasId];
	}
);
