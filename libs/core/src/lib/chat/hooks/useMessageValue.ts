import {
	channelsActions,
	selectCurrentChannelId,
	selectDmGroupCurrentId,
	selectModeResponsive,
	selectRequestByChannelId,
	useAppDispatch
} from '@mezon/store';
import { ModeResponsive, RequestInput } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useMessageValue(channelId?: string) {
	const dispatch = useAppDispatch();
	const mode = useSelector(selectModeResponsive);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentDmGroupId = useSelector(selectDmGroupCurrentId);
	const request = useSelector(selectRequestByChannelId(mode === ModeResponsive.MODE_CLAN ? channelId || '' : currentDmGroupId || ''));

	const setRequestInput = useCallback(
		(request: RequestInput, isThread?: boolean) => {
			if (mode === ModeResponsive.MODE_CLAN) {
				dispatch(
					channelsActions.setRequestInput({
						channelId: isThread ? currentChannelId + String(isThread) : (currentChannelId as string),
						request
					})
				);
			} else {
				dispatch(
					channelsActions.setRequestInput({
						channelId: currentDmGroupId || '',
						request
					})
				);
			}
		},
		[currentChannelId, currentDmGroupId, mode, dispatch]
	);

	const setModeResponsive = useCallback(
		(value: string) => {
			dispatch(channelsActions.setModeResponsive(value));
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			currentChannelId,
			mode,
			currentDmGroupId,
			request,
			setRequestInput,
			setModeResponsive
		}),
		[setRequestInput, setModeResponsive, request, currentDmGroupId, mode, currentChannelId]
	);
}
