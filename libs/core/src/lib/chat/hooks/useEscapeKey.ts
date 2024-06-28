import { messagesActions, reactionActions, referencesActions } from '@mezon/store';
import { RightClickPos } from '@mezon/utils';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useEscapeKey = (handler: () => void) => {
	const dispatch = useDispatch();
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				dispatch(referencesActions.setOpenReplyMessageState(false));
				dispatch(referencesActions.setIdReferenceMessageReply(''));
				dispatch(referencesActions.setIdMessageToJump(''));
				dispatch(messagesActions.setOpenOptionMessageState(false));
				dispatch(referencesActions.setDataReferences(null));
				dispatch(reactionActions.setMessageMatchWithRef(false));
				handler();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [dispatch, handler]);
};
