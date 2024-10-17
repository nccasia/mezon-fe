import { channelsActions, selectModeResponsive, selectRequestByChannelId, useAppDispatch } from '@mezon/store';
import { ModeResponsive, RequestInput } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppParams } from '../../app/hooks/useAppParams';

export function useMessageValue() {
	const dispatch = useAppDispatch();
	const mode = useSelector(selectModeResponsive);

	const { channelId, directId } = useAppParams();
	const currentIdFrParam = channelId || directId;
	const request = useSelector(selectRequestByChannelId(currentIdFrParam ?? ''));

	const setRequestInput = useCallback(
		(request: RequestInput, isThread?: boolean) => {
			if (mode === ModeResponsive.MODE_CLAN) {
				dispatch(
					channelsActions.setRequestInput({
						channelId: isThread ? currentIdFrParam + String(isThread) : (currentIdFrParam as string),
						request
					})
				);
			} else {
				dispatch(
					channelsActions.setRequestInput({
						channelId: currentIdFrParam || '',
						request
					})
				);
			}
		},
		[currentIdFrParam, mode, dispatch]
	);

	const setModeResponsive = useCallback(
		(value: string) => {
			dispatch(channelsActions.setModeResponsive(value));
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			mode,
			currentIdFrParam,
			request,
			setRequestInput,
			setModeResponsive
		}),
		[setRequestInput, setModeResponsive, request, currentIdFrParam, mode]
	);
}
