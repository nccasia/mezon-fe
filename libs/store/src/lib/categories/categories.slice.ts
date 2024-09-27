import { ICategory, LoadingStatus, SortChannel } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiCategoryDesc, ApiCreateCategoryDescRequest, ApiUpdateCategoryDescRequest, ApiUpdateCategoryOrderRequest } from 'mezon-js/api.gen';
import { channelsActions } from '../channels/channels.slice';
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
	showEmptyCategory: boolean;
	ctrlKSelectedChannelId?: string;
}

export const categoriesAdapter = createEntityAdapter<CategoriesEntity>();

type fetchCategoriesPayload = {
	clanId: string;
};

type updatCategoryPayload = {
	clanId: string;
	request: ApiUpdateCategoryDescRequest;
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

export const deleteCategory = createAsyncThunk(
	'categories/deleteCategory',
	async ({ clanId, categoryId }: { clanId: string; categoryId: string }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.deleteCategoryDesc(mezon.session, categoryId, clanId);
			if (response) {
				thunkAPI.dispatch(fetchCategories({ clanId }));
				thunkAPI.dispatch(channelsActions.setCurrentChannelId(''));
				thunkAPI.dispatch(channelsActions.removeRememberChannel({ clanId }));
			}
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const updateCategoriesOrder = createAsyncThunk(
	'categories/updateCategoriesOrder',
	async ({ clan_id, categories }: ApiUpdateCategoryOrderRequest, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.updateCategoryOrder(mezon.session, {
				clan_id: clan_id,
				categories: categories
			});
			thunkAPI.dispatch(fetchCategories({ clanId: clan_id || '' }));
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

export const deleteCategoriesOrder = createAsyncThunk('categories/deleteCategoriesOrder', async (clanId: string, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteCategoryOrder(mezon.session, clanId);
		thunkAPI.dispatch(fetchCategories({ clanId: clanId }));
		console.log(response);
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const updateCategory = createAsyncThunk('categories/updateCategory', async ({ clanId, request }: updatCategoryPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		await mezon.client.updateCategory(mezon.session, clanId, request);
		thunkAPI.dispatch(fetchCategories({ clanId }));
	} catch (error) {
		return thunkAPI.rejectWithValue([]);
	}
});

export const initialCategoriesState: CategoriesState = categoriesAdapter.getInitialState({
	loadingStatus: 'not loaded',
	categories: [],
	error: null,
	sortChannelByCategoryId: {},
	showEmptyCategory: false
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
		setShowEmptyCategory: (state) => {
			state.showEmptyCategory = true;
		},
		setHideEmptyCategory: (state) => {
			state.showEmptyCategory = false;
		},
		setCtrlKSelectedChannelId: (state, action: PayloadAction<string>) => {
			state.ctrlKSelectedChannelId = action.payload;
		}
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

		builder
			.addCase(deleteCategory.pending, (state: CategoriesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(deleteCategory.fulfilled, (state: CategoriesState) => {
				state.loadingStatus = 'loaded';
			})
			.addCase(deleteCategory.rejected, (state: CategoriesState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	}
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
export const categoriesActions = {
	...categoriesSlice.actions,
	fetchCategories,
	createNewCategory,
	updateCategory,
	deleteCategory,
	updateCategoriesOrder,
	deleteCategoriesOrder
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
	clanId ? categoriesEntities[clanId] : null
);

export const selectDefaultCategory = createSelector(selectAllCategories, (categories) => categories[0]);

export const selectCategoriesIds = createSelector(getCategoriesState, (entities) => entities.ids);

export const selectIsShowEmptyCategory = createSelector(getCategoriesState, (state) => state.showEmptyCategory);

export const selectCtrlKSelectedChannelId = createSelector(getCategoriesState, (state) => state.ctrlKSelectedChannelId);
