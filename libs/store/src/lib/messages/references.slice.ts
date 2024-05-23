import { IMessage, IMessageWithUser } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiMessageAttachment, ApiMessageRef } from 'mezon-js/api.gen';

export const REFERENCES_FEATURE_KEY = 'references';

/*
 * Update these interfaces according to your requirements.
 */
export interface ReferencesEntity extends IMessage {
	id: string;
}

export interface ReferencesState extends EntityState<ReferencesEntity, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	reference: IMessageWithUser | null;
	dataReferences: ApiMessageRef[];
	idMessageToJump: string;
	openEditMessageState: boolean;
	openReplyMessageState: boolean;
	attachmentDataRef: ApiMessageAttachment[];
	idMessageRefReply: string;
	idMessageRefReaction: string;
}

export const referencesAdapter = createEntityAdapter<ReferencesEntity>();

export const fetchReferences = createAsyncThunk<ReferencesEntity[]>('references/fetchStatus', async (_, thunkAPI) => {
	return Promise.resolve([]);
});

export const initialReferencesState: ReferencesState = referencesAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	reference: null,
	dataReferences: [],
	idMessageToJump: '',
	openEditMessageState: false,
	openReplyMessageState: false,
	attachmentDataRef: [],
	idMessageRefReply: '',
	idMessageRefReaction: '',
});

export const referencesSlice = createSlice({
	name: REFERENCES_FEATURE_KEY,
	initialState: initialReferencesState,
	reducers: {
		add: referencesAdapter.addOne,
		remove: referencesAdapter.removeOne,
		setReferenceMessage(state, action) {
			state.reference = action.payload;
		},
		setDataReferences(state, action) {
			state.dataReferences = action.payload;
		},

		setIdMessageToJump(state, action) {
			state.idMessageToJump = action.payload;
		},
		setOpenEditMessageState(state, action) {
			state.openEditMessageState = action.payload;
		},
		setOpenReplyMessageState(state, action) {
			state.openReplyMessageState = action.payload;
		},
		setAttachmentData(state, action) {
			if (Array.isArray(action.payload)) {
				state.attachmentDataRef = action.payload;
			} else {
				state.attachmentDataRef.push(action.payload);
			}
		},
		setIdReferenceMessageReply(state, action) {
			state.idMessageRefReply = action.payload;
		},
		setIdReferenceMessageReaction(state, action) {
			state.idMessageRefReaction = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchReferences.pending, (state: ReferencesState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchReferences.fulfilled, (state: ReferencesState, action: PayloadAction<ReferencesEntity[]>) => {
				referencesAdapter.setAll(state, action.payload);
				state.loadingStatus = 'loaded';
			})
			.addCase(fetchReferences.rejected, (state: ReferencesState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			});
	},
});

export const referencesReducer = referencesSlice.reducer;

export const referencesActions = referencesSlice.actions;

const { selectAll, selectEntities } = referencesAdapter.getSelectors();

export const getReferencesState = (rootState: { [REFERENCES_FEATURE_KEY]: ReferencesState }): ReferencesState => rootState[REFERENCES_FEATURE_KEY];

export const selectAllReferences = createSelector(getReferencesState, selectAll);

export const selectReferencesEntities = createSelector(getReferencesState, selectEntities);

export const selectReferenceMessage = createSelector(getReferencesState, (state: ReferencesState) => state.reference);

export const selectDataReferences = createSelector(getReferencesState, (state: ReferencesState) => state.dataReferences);

export const selectIdMessageReplied = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageToJump);

export const selectOpenEditMessageState = createSelector(getReferencesState, (state: ReferencesState) => state.openEditMessageState);

export const selectOpenReplyMessageState = createSelector(getReferencesState, (state: ReferencesState) => state.openReplyMessageState);

export const selectAttachmentData = createSelector(getReferencesState, (state: ReferencesState) => state.attachmentDataRef);

export const selectIdMessageRefReply = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageRefReply);

export const selectIdMessageRefReaction = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageRefReaction);
