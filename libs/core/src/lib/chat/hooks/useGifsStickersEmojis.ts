import { gifsStickerEmojiActions, useAppDispatch } from '@mezon/store';
import { SubPanelName } from '@mezon/utils';
import { selectPlaceHolder, selectSubPanelActive, selectValueInputSearch } from 'libs/store/src/lib/giftStickerEmojiPanel/gifsStickerEmoji.slice';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useGifsStickersEmoji() {
	const dispatch = useAppDispatch();
	const subPanelActive = useSelector(selectSubPanelActive);
	const valueInputToCheckHandleSearch = useSelector(selectValueInputSearch);
	const valuePlaceHolder = useSelector(selectPlaceHolder);

	const setSubPanelActive = useCallback(
		(state: SubPanelName) => {
			dispatch(gifsStickerEmojiActions.setSubPanelActive(state));
		},
		[dispatch],
	);

	const setValueInputSearch = useCallback(
		(valueSearch: string) => {
			dispatch(gifsStickerEmojiActions.setValueInputSearch(valueSearch));
		},
		[dispatch],
	);

	const setPlaceHolderInput = useCallback(
		(valuePlaceHolder: string) => {
			dispatch(gifsStickerEmojiActions.setPlaceHolderInput(valuePlaceHolder));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			subPanelActive,
			setSubPanelActive,
			valueInputToCheckHandleSearch,
			setValueInputSearch,
			setPlaceHolderInput,
			valuePlaceHolder,
		}),
		[subPanelActive,
		setSubPanelActive,
		valueInputToCheckHandleSearch,
		setValueInputSearch,
		setPlaceHolderInput,
		valuePlaceHolder],
	);
}
