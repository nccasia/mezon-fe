import { EUploadingStatus, IMessage, PreSendAttachment, UploadingAttachmentStatus } from '@mezon/utils';
import { EntityState, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { ApiMessageRef } from 'mezon-js/api.gen';

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
	idMessageRefReply: Record<string, string>;
	idMessageRefReaction: string;
	idMessageRefEdit: string;
	statusLoadingAttachment: boolean;
	idMessageMention: string;
	attachmentAfterUpload: Record<string, PreSendAttachment>;
	uploadingStatuses: Record<string, Record<string, UploadingAttachmentStatus>>;
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
	idMessageRefReply: {},
	idMessageRefReaction: '',
	idMessageRefEdit: '',
	statusLoadingAttachment: false,
	idMessageMention: '',
	attachmentAfterUpload: {},
	uploadingStatuses: {}
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

		updateAttachmentMessageId(state, action: PayloadAction<{ channelId: string; messageId: string }>) {
			const { channelId, messageId } = action.payload;
			const attachment = state.attachmentAfterUpload[channelId];

			if (attachment && attachment.messageId === '') {
				state.attachmentAfterUpload[channelId] = {
					...attachment,
					messageId
				};
			}
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
		setAtachmentAfterUpload(state, action: PayloadAction<PreSendAttachment>) {
			const newAttachment = action.payload;
			const { channelId, files, messageId } = newAttachment;

			if (!channelId) {
				return;
			}

			if (!state.attachmentAfterUpload[channelId]) {
				state.attachmentAfterUpload[channelId] = {
					channelId: channelId,
					files: files,
					messageId: messageId || ''
				};
			} else {
				if (files && files.length > 0) {
					state.attachmentAfterUpload[channelId].files = [...state.attachmentAfterUpload[channelId].files, ...files];
				}

				if (messageId) {
					state.attachmentAfterUpload[channelId].messageId = messageId;
				}
			}

			if (files && files.length === 0) {
				delete state.attachmentAfterUpload[channelId];
			}
		},

		removeAttachment(state, action: PayloadAction<{ channelId: string; index: number }>) {
			const { channelId, index } = action.payload;

			const attachment = state.attachmentAfterUpload[channelId];

			if (attachment) {
				if (index >= 0 && index < attachment.files.length) {
					// Remove the file at the specified index
					attachment.files.splice(index, 1);

					// If no files are left, remove the attachment entry
					if (attachment.files.length === 0) {
						delete state.attachmentAfterUpload[channelId];
					} else {
						// Update the attachment entry with the remaining files
						state.attachmentAfterUpload[channelId] = {
							...attachment,
							files: [...attachment.files]
						};
					}
				}
			}
		},

		setUploadingStatus: (
			state,
			action: PayloadAction<{ channelId: string; messageId: string; statusUpload: EUploadingStatus; count: number }>
		) => {
			const { channelId, messageId, statusUpload, count } = action.payload;

			if (!state.uploadingStatuses[channelId]) {
				state.uploadingStatuses[channelId] = {};
			}

			if (count > 0) {
				state.uploadingStatuses[channelId][messageId] = {
					statusUpload,
					count
				};
			} else {
				delete state.uploadingStatuses[channelId][messageId];
			}
		},

		setIdReferenceMessageReply(state, action: PayloadAction<{ channelId: string; idMessageRefReply: string }>) {
			state.idMessageRefReply[action.payload.channelId] = action.payload.idMessageRefReply;
		},
		setIdReferenceMessageReaction(state, action) {
			state.idMessageRefReaction = action.payload;
		},
		setIdReferenceMessageEdit(state, action) {
			state.idMessageRefEdit = action.payload;
		}
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
	}
});

export const referencesReducer = referencesSlice.reducer;

export const referencesActions = {
	...referencesSlice.actions
};

const { selectAll, selectEntities } = referencesAdapter.getSelectors();

export const getReferencesState = (rootState: { [REFERENCES_FEATURE_KEY]: ReferencesState }): ReferencesState => rootState[REFERENCES_FEATURE_KEY];

export const selectAllReferences = createSelector(getReferencesState, selectAll);

export const selectReferencesEntities = createSelector(getReferencesState, selectEntities);

export const selectDataReferences = createSelector(getReferencesState, (state: ReferencesState) => state.dataReferences);

export const selectOpenEditMessageState = createSelector(getReferencesState, (state: ReferencesState) => state.openEditMessageState);

export const selectIdMessageRefReaction = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageRefReaction);

export const selectIdMessageRefEdit = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageRefEdit);

export const selectStatusLoadingAttachment = createSelector(getReferencesState, (state: ReferencesState) => state.statusLoadingAttachment);

export const selectMessageMetionId = createSelector(getReferencesState, (state: ReferencesState) => state.idMessageMention);

export const selectAttachmentAfterUpload = createSelector(getReferencesState, (state: ReferencesState) => state.attachmentAfterUpload);

export const selectUploadingStatus = (channelId: string, messageId: string) =>
	createSelector(
		(state: { references: ReferencesState }) => state.references.uploadingStatuses,
		(uploadingStatuses) => {
			const status = uploadingStatuses[channelId]?.[messageId];
			return {
				statusUpload: status?.statusUpload,
				count: status?.count ?? 0
			};
		}
	);

export const selectIdMessageRefReply = (channelId: string) =>
	createSelector(getReferencesState, (state: ReferencesState) => {
		return state.idMessageRefReply[channelId] || '';
	});

export const selectAttachmentByChannelId = (channelId: string) =>
	createSelector(selectAttachmentAfterUpload, (attachmentAfterUpload) => attachmentAfterUpload[channelId] || null);
