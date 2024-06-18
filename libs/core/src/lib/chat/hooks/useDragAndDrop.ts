import { dragAndDropAction, selectDragAndDropState } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useDragAndDrop() {
	const dispatch = useDispatch();
	const draggingState = useSelector(selectDragAndDropState);

	const setDraggingState = useCallback(
		(status: boolean) => {
			dispatch(dragAndDropAction.setDraggingState(status));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			draggingState,
			setDraggingState,
		}),
		[draggingState, setDraggingState],
	);
}
