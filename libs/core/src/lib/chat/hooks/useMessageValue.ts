import { channelsActions, selectAllTextInput, selectCurrentChannelId, selectDmGroupCurrentId, selectMode, selectValueTextInputByChannelId, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useMessageValue(channelId?: string) {
	const dispatch = useAppDispatch();
	const mode = useSelector(selectMode);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentDmGroupId = useSelector(selectDmGroupCurrentId);
	const valueTextInput = useSelector(selectValueTextInputByChannelId(mode === 'clan' ? (channelId || '') : (currentDmGroupId || '')));
	const allTextInput = useSelector(selectAllTextInput);

	const setValueTextInput = useCallback(
		(value: string, isThread?: boolean) => {
			if(mode === 'clan'){
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

	const setMode = useCallback(
		(value: string) => {
			dispatch(
				channelsActions.setMode(value)
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
			setMode,
		}),
		[setValueTextInput, setMode, valueTextInput, allTextInput, currentDmGroupId, mode, currentChannelId],
	);
}


