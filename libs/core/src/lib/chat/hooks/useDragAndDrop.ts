import { dragAndDropAction, selectDragAndDropState, selectOverLimitUploadState } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useDragAndDrop() {
	const dispatch = useDispatch();
	const draggingState = useSelector(selectDragAndDropState);
	const isOverUploading = useSelector(selectOverLimitUploadState);
	const setDraggingState = useCallback(
		(status: boolean) => {
			dispatch(dragAndDropAction.setDraggingState(status));
		},
		[dispatch]
	);
	const setOverUploadingState = useCallback(
		(status: boolean) => {
			dispatch(dragAndDropAction.setOverLimitUploadState(status));
		},
		[dispatch]
	);
	return useMemo(
		() => ({
			draggingState,
			setDraggingState,
			isOverUploading,
			setOverUploadingState
		}),
		[draggingState, isOverUploading, setDraggingState, setOverUploadingState]
	);
}
