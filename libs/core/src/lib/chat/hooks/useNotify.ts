import { notificationActions, selectAllNotification, selectMessageNotified, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useNotification() {
	const dispatch = useAppDispatch();
	const notification = useSelector(selectAllNotification);
	const idMessageNotified = useSelector(selectMessageNotified);
	const deleteNotify = useCallback(
		(id: string, clanId: string) => {
			const ids = [id];
			dispatch(notificationActions.deleteNotify({ ids, clanId }));
		},
		[dispatch]
	);

	const setMessageNotifiedId = useCallback(
		(idMessageNotified: string) => {
			dispatch(notificationActions.setMessageNotifiedId(idMessageNotified));
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			notification,
			deleteNotify,
			setMessageNotifiedId,
			idMessageNotified
		}),
		[notification, deleteNotify, setMessageNotifiedId, idMessageNotified]
	);
}
