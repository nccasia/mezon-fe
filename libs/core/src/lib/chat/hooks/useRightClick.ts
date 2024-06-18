import { rightClickAction, selectMessageIdRightClicked, selectRightClickXy } from 'libs/store/src/lib/rightClick/rightClick.slice';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useRightClick() {
	const dispatch = useDispatch();
	const rightClickXy = useSelector(selectRightClickXy);
	const getMessageIdRightClicked = useSelector(selectMessageIdRightClicked);
	const setRightClickXy = useCallback(
		(status: any) => {
			dispatch(rightClickAction.setRightClickXy(status));
		},
		[dispatch],
	);
	const setMessageRightClick = useCallback(
		(messageId: string) => {
			dispatch(rightClickAction.setMessageRightClick(messageId));
		},
		[dispatch],
	);
	return useMemo(
		() => ({
			rightClickXy,
			setRightClickXy,
			setMessageRightClick,
			getMessageIdRightClicked,
		}),
		[rightClickXy, setRightClickXy, setMessageRightClick, getMessageIdRightClicked],
	);
}
