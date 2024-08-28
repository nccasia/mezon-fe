import {
	messagesActions,
	referencesActions,
	selectAttachmentByChannelId,
	selectDataReferences,
	selectIdMessageToJump,
	selectOpenOptionMessageState,
	selectOpenThreadMessageState,
	selectStatusLoadingAttachment,
	threadsActions,
	useAppDispatch
} from '@mezon/store';
import { ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useReference(channelId?: string) {
	const dispatch = useAppDispatch();
	const dataReferences = useSelector(selectDataReferences);
	const openThreadMessageState = useSelector(selectOpenThreadMessageState);
	const openOptionMessageState = useSelector(selectOpenOptionMessageState);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const statusLoadingAttachment = useSelector(selectStatusLoadingAttachment);
	const attachmentFilteredByChannelId = useSelector(selectAttachmentByChannelId(channelId ?? ''));

	const checkAttachment = useMemo(() => {
		return attachmentFilteredByChannelId?.files?.length > 0;
	}, [attachmentFilteredByChannelId]);

	const setStatusLoadingAttachment = useCallback(
		(status: boolean) => {
			dispatch(referencesActions.setStatusLoadingAttachment(status));
		},
		[dispatch]
	);

	const setDataReferences = useCallback(
		(dataReference: ApiMessageRef[]) => {
			dispatch(referencesActions.setDataReferences(dataReference));
		},
		[dispatch]
	);

	const setIdMessageToJump = useCallback(
		(idMessageToJump: string) => {
			dispatch(messagesActions.setIdMessageToJump(idMessageToJump));
		},
		[dispatch]
	);

	const setOpenThreadMessageState = useCallback(
		(status: boolean) => {
			dispatch(threadsActions.setOpenThreadMessageState(status));
		},
		[dispatch]
	);

	const setOpenOptionMessageState = useCallback(
		(status: boolean) => {
			dispatch(messagesActions.setOpenOptionMessageState(status));
		},
		[dispatch]
	);

	const removeAttachmentByIndex = (channelId: string, indexItem: number) => {
		dispatch(
			referencesActions.removeAttachment({
				channelId: channelId || '',
				index: indexItem
			})
		);
	};

	return useMemo(
		() => ({
			setDataReferences,
			setIdMessageToJump,
			setOpenThreadMessageState,
			dataReferences,
			openThreadMessageState,
			openOptionMessageState,
			idMessageToJump,
			setOpenOptionMessageState,
			statusLoadingAttachment,
			setStatusLoadingAttachment,
			removeAttachmentByIndex,
			attachmentFilteredByChannelId,
			checkAttachment
		}),
		[
			setDataReferences,
			setIdMessageToJump,
			setOpenThreadMessageState,
			dataReferences,
			openThreadMessageState,
			openOptionMessageState,
			idMessageToJump,
			setOpenOptionMessageState,
			statusLoadingAttachment,
			setStatusLoadingAttachment,
			removeAttachmentByIndex,
			attachmentFilteredByChannelId,
			checkAttachment,
			removeAttachmentByIndex
		]
	);
}
