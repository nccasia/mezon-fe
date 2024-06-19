import { appActions, selectCloseMenu, selectIsShowMemberList, selectStatusMenu, useAppDispatch } from '@mezon/store';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useMenu() {
	const dispatch = useAppDispatch();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const isShowMemberList = useSelector(selectIsShowMemberList);

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
				closeMenu, 
				statusMenu, 
				isShowMemberList, 
				setCloseMenu, 
				setStatusMenu, 
			}
		),
		[
			closeMenu, 
			statusMenu, 
			isShowMemberList, 
			setCloseMenu, 
			setStatusMenu,
		],
	);
}
