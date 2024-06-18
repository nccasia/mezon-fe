// import { rightClickAction, selectRightClickXy } from '@mezon/store';
import { rightClickAction, selectRightClickXy,  } from 'libs/store/src/lib/rightClick/rightClick.slice';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useRightClick() {
	const dispatch = useDispatch();
	const rightClickXy= useSelector(selectRightClickXy)
	const setRightClickXy = useCallback(
		(status: any) => {
			dispatch(rightClickAction.setRightClickXy(status));
		},
		[dispatch],
	);
	return useMemo(
		() => ({
			rightClickXy,
			setRightClickXy,
		}),
		[, setRightClickXy],
	);
}
