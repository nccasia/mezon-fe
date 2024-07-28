import { channelsActions, selectAllTextInput, selectCurrentChannelId, selectDmGroupCurrentId, selectModeResponsive, selectValueTextInputByChannelId, useAppDispatch } from '@mezon/store';
import { ModeResponsive } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useMessageValue(channelId?: string) {
	const dispatch = useAppDispatch();
	const mode = useSelector(selectModeResponsive);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentDmGroupId = useSelector(selectDmGroupCurrentId);
	const valueTextInput = useSelector(selectValueTextInputByChannelId(mode === ModeResponsive.MODE_CLAN ? (channelId || '') : (currentDmGroupId || '')));
	const allTextInput = useSelector(selectAllTextInput);

	const setValueTextInput = useCallback(
		(value: string, isThread?: boolean) => {
			if(mode === ModeResponsive.MODE_CLAN){
				dispatch(
					channelsActions.setValueTextInput({
						channelId: isThread ? currentChannelId + String(isThread) : (currentChannelId as string),
						value,
					}),
				);
			} else {
				dispatch(
					channelsActions.setValueTextInput({
						channelId: currentDmGroupId || '',
						value,
					}),
				);
			}
			
		},
		[currentChannelId, currentDmGroupId, mode, dispatch],
	);

	const setModeResponsive = useCallback(
		(value: string) => {
			dispatch(
				channelsActions.setModeResponsive(value)
			);
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			currentChannelId,
			mode,
			currentDmGroupId,
			allTextInput,
			valueTextInput,
			setValueTextInput,
			setModeResponsive,
		}),
		[setValueTextInput, setModeResponsive, valueTextInput, allTextInput, currentDmGroupId, mode, currentChannelId],
	);
}


