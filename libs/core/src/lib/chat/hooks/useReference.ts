import {
	messagesActions,
	referencesActions,
	selectAttachmentByChannelId,
	selectIdMessageToJump,
	selectOpenOptionMessageState,
	selectOpenThreadMessageState,
	threadsActions,
	useAppDispatch
} from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useReference(channelId?: string) {
	const dispatch = useAppDispatch();
	const openThreadMessageState = useSelector(selectOpenThreadMessageState);
	const openOptionMessageState = useSelector(selectOpenOptionMessageState);
	const idMessageToJump = useSelector(selectIdMessageToJump);
	const attachmentFilteredByChannelId = useSelector(selectAttachmentByChannelId(channelId ?? ''));

	const checkAttachment = useMemo(() => {
		return attachmentFilteredByChannelId?.files?.length > 0;
	}, [attachmentFilteredByChannelId]);

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

	const removeAttachmentByIndex = useCallback(
		(channelId: string, indexItem: number) => {
			dispatch(
				referencesActions.removeAttachment({
					channelId: channelId || '',
					index: indexItem
				})
			);
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			setIdMessageToJump,
			setOpenThreadMessageState,
			openThreadMessageState,
			openOptionMessageState,
			idMessageToJump,
			setOpenOptionMessageState,
			removeAttachmentByIndex,
			attachmentFilteredByChannelId,
			checkAttachment
		}),
		[
			setIdMessageToJump,
			setOpenThreadMessageState,
			openThreadMessageState,
			openOptionMessageState,
			idMessageToJump,
			setOpenOptionMessageState,
			removeAttachmentByIndex,
			attachmentFilteredByChannelId,
			checkAttachment
		]
	);
}
