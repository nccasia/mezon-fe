import { IMessage } from '@mezon/utils';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
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
	dataReferences: ApiMessageRef[];
	openEditMessageState: boolean;
	openReplyMessageState: boolean;
	attachmentDataRef: Record<string, ApiMessageAttachment[]>;
	idMessageRefReply: string;
	idMessageRefReaction: string;
	idMessageRefEdit: string;
	statusLoadingAttachment: boolean;
	idMessageMention: string;
}

export const referencesAdapter = createEntityAdapter<ReferencesEntity>();

export const fetchReferences = createAsyncThunk<ReferencesEntity[]>('references/fetchStatus', async (_, thunkAPI) => {
	return Promise.resolve([]);
});

export const initialReferencesState: ReferencesState = referencesAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	dataReferences: [],
	idMessageToJump: '',
	openEditMessageState: false,
	openReplyMessageState: false,
	attachmentDataRef: {},
	idMessageRefReply: '',
	idMessageRefReaction: '',
	idMessageRefEdit: '',
	statusLoadingAttachment: false,
	idMessageMention: '',
});

export const referencesSlice = createSlice({
	name: REFERENCES_FEATURE_KEY,
	initialState: initialReferencesState,
	reducers: {
		add: referencesAdapter.addOne,
		remove: referencesAdapter.removeOne,

		setMessageMentionId(state, action) {
			state.idMessageMention = action.payload;
		},

		setDataReferences(state, action) {
			state.dataReferences = action.payload;
		},

		setStatusLoadingAttachment(state, action) {
			state.statusLoadingAttachment = action.payload;
		},

		setOpenEditMessageState(state, action) {
			state.openEditMessageState = action.payload;
		},
		setOpenReplyMessageState(state, action) {
			state.openReplyMessageState = action.payload;
		},
		setAttachmentData(state, action: PayloadAction<{ channelId: string; attachments: ApiMessageAttachment[] }>) {
			const { channelId, attachments } = action.payload;
			if (!state.attachmentDataRef[channelId]) {
				state.attachmentDataRef[channelId] = [];
			}
			if (attachments.length === 0) {
				state.attachmentDataRef[channelId] = attachments;
			} else {
				state.attachmentDataRef[channelId] = [...state.attachmentDataRef[channelId], ...attachments];
			}
		},
		removeAttachment(state, action: PayloadAction<{ channelId: string; urlAttachment: string }>) {
			const attachments = state.attachmentDataRef[action.payload.channelId];
			if (attachments) {
				state.attachmentDataRef[action.payload.channelId] = attachments.filter(
					(attachment) => attachment.url !== action.payload.urlAttachment && attachment.filename !== action.payload.urlAttachment,
				);
			}
		},
		setIdReferenceMessageReply(state, action) {
			state.idMessageRefReply = action.payload;
		},
		setIdReferenceMessageReaction(state, action) {
			state.idMessageRefReaction = action.payload;
		},
		setIdReferenceMessageEdit(state, action) {
			state.idMessageRefEdit = action.payload;
		},
		resetDataAttachment(state, action: PayloadAction<{ channelId: string }>) {
			state.attachmentDataRef[action.payload.channelId] = [];
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

export const referencesActions = {
	...referencesSlice.actions,
};

const { selectAll, selectEntities } = referencesAdapter.getSelectors();

export const getReferencesState = (rootState: { [REFERENCES_FEATURE_KEY]: ReferencesState }): ReferencesState => rootState[REFERENCES_FEATURE_KEY];

export const selectAllReferences = createSelector(getReferencesState, selectAll);

export const selectReferencesEntities = createSelector(getReferencesState, selectEntities);

export const selectDataReferences = createSelector(getReferencesState, (state: ReferencesState) => state.dataReferences);

export const selectOpenEditMessageState = createSelector(getReferencesState, (state: ReferencesState) => state.openEditMessageState);

export const selectOpenReplyMessageState = createSelector(getReferencesState, (state: ReferencesState) => state.openReplyMessageState);

export const selectIdMessageRefReply = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageRefReply);

export const selectIdMessageRefReaction = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageRefReaction);

export const selectIdMessageRefEdit = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageRefEdit);

export const selectStatusLoadingAttachment = createSelector(getReferencesState, (state: ReferencesState) => state.statusLoadingAttachment);

export const selectMessageMetionId = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageMention);

export const selectAttachmentData = (channelId: string) =>
	createSelector(getReferencesState, (state: ReferencesState) => {
		return state.attachmentDataRef[channelId] || [];
	});
