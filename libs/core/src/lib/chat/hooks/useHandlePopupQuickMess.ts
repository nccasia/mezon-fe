import { appActions, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';

export function useHandlePopupQuickMess() {
	const dispatch = useAppDispatch();

	const handleOpenPopupQuickMess = useCallback(() => {
		dispatch(appActions.setIsShowPopupQuickMess(true));
	}, [dispatch]);

	const handleClosePopupQuickMess = useCallback(() => {
		dispatch(appActions.setIsShowPopupQuickMess(false));
	}, [dispatch]);

	return useMemo(
		() => ({
			handleOpenPopupQuickMess,
			handleClosePopupQuickMess
		}),
		[handleOpenPopupQuickMess, handleClosePopupQuickMess]
	);
}
