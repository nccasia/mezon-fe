import { reactionActions, referencesActions } from '@mezon/store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useEscapeKey = (handler: () => void) => {
	const dispatch = useDispatch();
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				// disable reply
				dispatch(referencesActions.setOpenReplyMessageState(false));
				dispatch(referencesActions.setReferenceMessage(null));
				dispatch(referencesActions.setDataReferences(null));
				dispatch(reactionActions.setMessageMatchWithRef(false));
				handler();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [handler]);
};
