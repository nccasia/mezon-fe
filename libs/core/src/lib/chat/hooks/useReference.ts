import {
	messagesActions,
	referencesActions,
	selectAttachmentData,
	selectDataReferences,
	selectIdMessageMention,
	selectIdMessageRefEdit,
	selectIdMessageRefOption,
	selectIdMessageRefReaction,
	selectIdMessageRefReply,
	selectIdMessageToJump,
	selectOpenEditMessageState,
	selectOpenOptionMessageState,
	selectOpenReplyMessageState,
	selectOpenThreadMessageState,
	selectStatusLoadingAttachment,
	threadsActions,
	useAppDispatch,
} from '@mezon/store';
import { ApiMessageAttachment, ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useReference() {
	const dispatch = useAppDispatch();
	const dataReferences = useSelector(selectDataReferences);
	const openEditMessageState = useSelector(selectOpenEditMessageState);
	const openReplyMessageState = useSelector(selectOpenReplyMessageState);
	const openThreadMessageState = useSelector(selectOpenThreadMessageState);
	const attachmentDataRef = useSelector(selectAttachmentData);
	const openOptionMessageState = useSelector(selectOpenOptionMessageState);
	const idMessageRefReply = useSelector(selectIdMessageRefReply);
	const idMessageRefReaction = useSelector(selectIdMessageRefReaction);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const idMessageRefEdit = useSelector(selectIdMessageRefEdit);
	const idMessageRefOpt = useSelector(selectIdMessageRefOption);
	const statusLoadingAttachment = useSelector(selectStatusLoadingAttachment);
	const idMessageMention = useSelector(selectIdMessageMention);

	const setStatusLoadingAttachment = useCallback(
		(status: boolean) => {
			dispatch(referencesActions.setStatusLoadingAttachment(status));
		},
		[dispatch],
	);

	const setDataReferences = useCallback(
		(dataReference: ApiMessageRef[]) => {
			dispatch(referencesActions.setDataReferences(dataReference));
		},
		[dispatch],
	);

	const setIdMessageToJump = useCallback(
		(idMessageToJump: string) => {
			dispatch(referencesActions.setIdMessageToJump(idMessageToJump));
		},
		[dispatch],
	);

	const setOpenEditMessageState = useCallback(
		(status: boolean) => {
			dispatch(referencesActions.setOpenEditMessageState(status));
		},
		[dispatch],
	);

	const setOpenReplyMessageState = useCallback(
		(status: boolean) => {
			dispatch(referencesActions.setOpenReplyMessageState(status));
		},
		[dispatch],
	);

	const setOpenThreadMessageState = useCallback(
		(status: boolean) => {
			dispatch(threadsActions.setOpenThreadMessageState(status));
		},
		[dispatch],
	);

	const setAttachmentData = useCallback(
		(attachment: ApiMessageAttachment | ApiMessageAttachment[]) => {
			dispatch(referencesActions.setAttachmentData(attachment));
		},
		[dispatch],
	);

	const setIdReferenceMessageReply = useCallback(
		(idMessageRefReply: string) => {
			dispatch(referencesActions.setIdReferenceMessageReply(idMessageRefReply));
		},
		[dispatch],
	);

	const setIdReferenceMessageReaction = useCallback(
		(idMessageRefReaction: string) => {
			dispatch(referencesActions.setIdReferenceMessageReaction(idMessageRefReaction));
		},
		[dispatch],
	);

	const setIdReferenceMessageEdit = useCallback(
		(idMessageRefEdit: string) => {
			dispatch(referencesActions.setIdReferenceMessageEdit(idMessageRefEdit));
		},
		[dispatch],
	);

	const setIdReferenceMessageOption = useCallback(
		(idMessageRefOpt: string) => {
			dispatch(referencesActions.setIdReferenceMessageOption(idMessageRefOpt));
		},
		[dispatch],
	);

	const setOpenOptionMessageState = useCallback(
		(status: boolean) => {
			dispatch(messagesActions.setOpenOptionMessageState(status));
		},
		[dispatch],
	);

	const setIdMessageMenttion = useCallback(
		(idMessageMention: string) => {
			dispatch(referencesActions.setIdMessageMention(idMessageMention));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			setDataReferences,
			setIdMessageToJump,
			setOpenEditMessageState,
			setOpenReplyMessageState,
			setOpenThreadMessageState,
			dataReferences,
			openEditMessageState,
			openReplyMessageState,
			openThreadMessageState,
			attachmentDataRef,
			setAttachmentData,
			openOptionMessageState,
			idMessageRefReply,
			setIdReferenceMessageReply,
			idMessageRefReaction,
			setIdReferenceMessageReaction,
			idMessageToJump,
			idMessageRefEdit,
			setIdReferenceMessageEdit,
			idMessageRefOpt,
			setIdReferenceMessageOption,
			setOpenOptionMessageState,
			statusLoadingAttachment,
			setStatusLoadingAttachment,
			setIdMessageMenttion,
			idMessageMention,
		}),
		[
			setDataReferences,
			setIdMessageToJump,
			setOpenEditMessageState,
			setOpenReplyMessageState,
			setOpenThreadMessageState,
			dataReferences,
			openEditMessageState,
			openReplyMessageState,
			openThreadMessageState,
			attachmentDataRef,
			setAttachmentData,
			openOptionMessageState,
			idMessageRefReply,
			setIdReferenceMessageReply,
			idMessageRefReaction,
			setIdReferenceMessageReaction,
			idMessageToJump,
			idMessageRefEdit,
			setIdReferenceMessageEdit,
			idMessageRefOpt,
			setIdReferenceMessageOption,
			setOpenOptionMessageState,
			statusLoadingAttachment,
			setStatusLoadingAttachment,
			setIdMessageMenttion,
			idMessageMention,
		],
	);
}
