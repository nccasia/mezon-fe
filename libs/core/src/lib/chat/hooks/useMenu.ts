import { appActions, useAppDispatch } from '@mezon/store';
import React, { useMemo } from 'react';

export function useMenu() {
	const dispatch = useAppDispatch();

	const setCloseMenu = React.useCallback(
		async (status: boolean) => {
			await dispatch(appActions.setCloseMenu(status));
		},
		[dispatch],
	);

	const setStatusMenu = React.useCallback(
		async (status: boolean) => {
			await dispatch(appActions.setStatusMenu(status));
		},
		[dispatch],
	);

	return useMemo(
		() => (
			{ 
				setCloseMenu, 
				setStatusMenu, 
			}
		),
		[
			setCloseMenu, 
			setStatusMenu,
		],
	);
}
