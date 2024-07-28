import {
	messagesActions,
	referencesActions,
	selectAttachmentData,
	selectDataReferences,
	selectIdMessageToJump,
	selectOpenOptionMessageState,
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
	const openThreadMessageState = useSelector(selectOpenThreadMessageState);
	const attachmentDataRef = useSelector(selectAttachmentData);
	const openOptionMessageState = useSelector(selectOpenOptionMessageState);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const statusLoadingAttachment = useSelector(selectStatusLoadingAttachment);

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

	const setOpenOptionMessageState = useCallback(
		(status: boolean) => {
			dispatch(messagesActions.setOpenOptionMessageState(status));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			setDataReferences,
			setIdMessageToJump,
			setOpenThreadMessageState,
			dataReferences,
			openThreadMessageState,
			attachmentDataRef,
			setAttachmentData,
			openOptionMessageState,
			idMessageToJump,
			setOpenOptionMessageState,
			statusLoadingAttachment,
			setStatusLoadingAttachment,
		}),
		[
			setDataReferences,
			setIdMessageToJump,
			setOpenThreadMessageState,
			dataReferences,
			openThreadMessageState,
			attachmentDataRef,
			setAttachmentData,
			openOptionMessageState,
			idMessageToJump,
			setOpenOptionMessageState,
			statusLoadingAttachment,
			setStatusLoadingAttachment,
		],
	);
}
