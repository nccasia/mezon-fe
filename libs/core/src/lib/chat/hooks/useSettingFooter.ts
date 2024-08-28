import { appActions, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';

export function useSettingFooter() {
	const dispatch = useAppDispatch();
	const setIsShowSettingFooterStatus = useCallback(
		(status: boolean) => {
			dispatch(appActions.setIsShowSettingFooterStatus(status));
		},
		[dispatch]
	);

	const setIsShowSettingFooterInitTab = useCallback(
		(value: string) => {
			dispatch(appActions.setIsShowSettingFooterInitTab(value));
		},
		[dispatch]
	);

	const setIsUserProfile = useCallback(
		(isUserProfile: boolean) => {
			dispatch(appActions.setIsUserProfile(isUserProfile));
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			setIsShowSettingFooterStatus,
			setIsShowSettingFooterInitTab,
			setIsUserProfile
		}),
		[setIsShowSettingFooterStatus, setIsShowSettingFooterInitTab, setIsUserProfile]
	);
}
