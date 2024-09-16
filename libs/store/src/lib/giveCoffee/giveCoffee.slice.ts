import { LoadingStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiGiveCoffeeEvent } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';

export const GIVE_COFEE = 'giveCoffee';

export interface GiveCoffeeEntity {
	id: string; // Primary ID
}

export interface GiveCoffeeState extends EntityState<GiveCoffeeEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	tokenSocket: Record<string, ApiGiveCoffeeEvent>;
	tokenUpdate: Record<string, number>;
}

export const giveCoffeeAdapter = createEntityAdapter<GiveCoffeeEntity>();

export const updateGiveCoffee = createAsyncThunk(
	'giveCoffee/updateGiveCoffee',
	async ({ channel_id, clan_id, message_ref_id, receiver_id, sender_id, token_count }: ApiGiveCoffeeEvent, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));

			const response = await mezon.client.givecoffee(mezon.session, {
				channel_id,
				clan_id,
				message_ref_id,
				receiver_id,
				sender_id,
				token_count
			});
			if (!response) {
				return thunkAPI.rejectWithValue([]);
			}
			return response;
		} catch (error: any) {
			const errmsg = await error.json();
			return thunkAPI.rejectWithValue(errmsg.message);
		}
	}
);

export const initialGiveCoffeeState: GiveCoffeeState = giveCoffeeAdapter.getInitialState({
	loadingStatus: 'not loaded',
	clans: [],
	error: null,
	tokenSocket: {},
	tokenUpdate: {}
});

export const giveCoffeeSlice = createSlice({
	name: GIVE_COFEE,
	initialState: initialGiveCoffeeState,
	reducers: {
		add: giveCoffeeAdapter.addOne,
		remove: giveCoffeeAdapter.removeOne,
		setTokenFromSocket: (state, action: PayloadAction<{ userId: string | undefined; coffeeEvent: ApiGiveCoffeeEvent }>) => {
			const { userId, coffeeEvent } = action.payload;

			if (!userId) return;

			state.tokenUpdate[userId] = state.tokenUpdate[userId] ?? 0;

			if (userId === coffeeEvent.receiver_id) {
				state.tokenUpdate[userId] += 1;
			} else if (userId === coffeeEvent.sender_id) {
				state.tokenUpdate[userId] -= 1;
			}
		}
	}
});

/*
 * Export reducer for store configuration.
 */
export const giveCoffeeReducer = giveCoffeeSlice.reducer;

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
 *   dispatch(clansActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const giveCoffeeActions = {
	...giveCoffeeSlice.actions,
	updateGiveCoffee
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
 * const entities = useSelector(selectAllClans);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
export const getCoffeeState = (rootState: { [GIVE_COFEE]: GiveCoffeeState }): GiveCoffeeState => rootState[GIVE_COFEE];

export const selectUpdateToken = (userId: string) =>
	createSelector(getCoffeeState, (state) => {
		const tokenValue = state.tokenUpdate[userId];
		return typeof tokenValue === 'number' && !isNaN(tokenValue) ? tokenValue : 0;
	});
