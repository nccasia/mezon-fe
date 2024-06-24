import { ICategory, LoadingStatus, SortChannel } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiCategoryDesc, ApiCreateCategoryDescRequest } from 'mezon-js/api.gen';
import { ensureSession, getMezonCtx } from '../helpers';
export const CATEGORIES_FEATURE_KEY = 'categories';

/*
 * Update these interfaces according to your requirements.
 */

export interface CategoriesEntity extends ICategory {
	id: string; // Primary ID
}

export const mapCategoryToEntity = (categoriesRes: ApiCategoryDesc) => {
	const id = (categoriesRes as unknown as any).category_id;
	return { ...categoriesRes, id };
};

export interface CategoriesState extends EntityState<CategoriesEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentCategoryId?: string | null;
	sortChannelByCategoryId: Record<string, boolean>;
}

export const categoriesAdapter = createEntityAdapter<CategoriesEntity>();

type fetchCategoriesPayload = {
	clanId: string;
};
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async ({ clanId }: fetchCategoriesPayload, thunkAPI) => {
	const mezon = await ensureSession(getMezonCtx(thunkAPI));
	const response = await mezon.client.listCategoryDescs(mezon.session, clanId);
	if (!response.categorydesc) {
		return [];
	}
	return response.categorydesc.map(mapCategoryToEntity);
});

export const createNewCategory = createAsyncThunk('categories/createCategories', async (body: ApiCreateCategoryDescRequest, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.createCategoryDesc(mezon.session, body);
		if (response) {
			thunkAPI.dispatch(fetchCategories({ clanId: body.clan_id as string }));
			return response;
		} else {
			return thunkAPI.rejectWithValue([]);
		}
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const initialCategoriesState: CategoriesState = categoriesAdapter.getInitialState({
	loadingStatus: 'not loaded',
	categories: [],
	error: null,
	sortChannelByCategoryId: {},
});

export const categoriesSlice = createSlice({
	name: CATEGORIES_FEATURE_KEY,
	initialState: initialCategoriesState,
	reducers: {
		add: categoriesAdapter.addOne,
		remove: categoriesAdapter.removeOne,
		changeCurrentCategory: (state, action: PayloadAction<string>) => {
			state.currentCategoryId = action.payload;
		},
		setCategoryIdSortChannel: (state, action: PayloadAction<SortChannel>) => {
			if (action.payload.categoryId) {
				state.sortChannelByCategoryId[action.payload.categoryId] = action.payload.isSortChannelByCategoryId;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCategories.pending, (state: CategoriesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchCategories.fulfilled, (state: CategoriesState, action: PayloadAction<ICategory[]>) => {
				categoriesAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchCategories.rejected, (state: CategoriesState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});

		builder
			.addCase(createNewCategory.pending, (state: CategoriesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(createNewCategory.fulfilled, (state: CategoriesState) => {
				state.loadingStatus = 'loaded';
			})
			.addCase(createNewCategory.rejected, (state: CategoriesState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

/*
 * Export reducer for store configuration.
 */
export const categoriesReducer = categoriesSlice.reducer;

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
 *   dispatch(categoriesActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const categoriesActions = { ...categoriesSlice.actions, fetchCategories, createNewCategory };

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllCategories);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = categoriesAdapter.getSelectors();

export const getCategoriesState = (rootState: { [CATEGORIES_FEATURE_KEY]: CategoriesState }): CategoriesState => rootState[CATEGORIES_FEATURE_KEY];
export const selectAllCategories = createSelector(getCategoriesState, selectAll);
export const selectCurrentCategoryId = createSelector(getCategoriesState, (state) => state.currentCategoryId);

export const selectCategoryIdSortChannel = createSelector(getCategoriesState, (state) => state.sortChannelByCategoryId);

export const selectCategoriesEntities = createSelector(getCategoriesState, selectEntities);

export const selectCategoryById = (id: string) => createSelector(selectCategoriesEntities, (categoriesEntities) => categoriesEntities[id]);

export const selectCurrentCategory = createSelector(selectCategoriesEntities, selectCurrentCategoryId, (categoriesEntities, clanId) =>
	clanId ? categoriesEntities[clanId] : null,
);
