import { appActions, selectIsShowMemberList, selectTheme, useAppDispatch } from '@mezon/store';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useApp() {
	const dispatch = useAppDispatch();
	const isShowMemberList = useSelector(selectIsShowMemberList);
	// TODO: separate theme into a separate hook
	const appearanceTheme = useSelector(selectTheme);
	const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)");
	const elementHTML = document.documentElement;

	const setAppearanceTheme = useCallback(
		(value: string) => {
			dispatch(appActions.setTheme(value));
		},
		[dispatch],
	);

	const setIsShowMemberList = useCallback(
		(value: boolean) => {
			dispatch(appActions.setIsShowMemberList(value));
		},
		[dispatch],
	);
	
	useEffect(()=>{
		switch(appearanceTheme){
			case undefined:
				setAppearanceTheme('dark');
				break;
			case "dark":
				elementHTML.classList.add('dark');
				break;
			case "light":
				elementHTML.classList.remove('dark');
				break;
			default:
				break;
		}
	}, [appearanceTheme])

	return useMemo(
		() => ({
			isShowMemberList,
			setIsShowMemberList,
			appearanceTheme,
			setAppearanceTheme,
			systemIsDark,
			elementHTML,
		}),
		[ isShowMemberList, setIsShowMemberList, appearanceTheme, setAppearanceTheme, systemIsDark, elementHTML],
	);
}
