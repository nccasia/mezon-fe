import { notificationActions, selectAllNotification, selectMessageNotifed, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useNotification() {
	const dispatch = useAppDispatch();
	const notification = useSelector(selectAllNotification);
	const idMessageNotifed = useSelector(selectMessageNotifed);

	const deleteNotify = useCallback(
		(id: string, clanId: string) => {
			const ids = [id];
			dispatch(notificationActions.deleteNotify({ ids, clanId }));
		},
		[dispatch]
	);

	const setMessageNotifedId = useCallback(
		(idMessageNotifed: string) => {
			dispatch(notificationActions.setMessageNotifedId(idMessageNotifed));
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			notification,
			deleteNotify,
			setMessageNotifedId,
			idMessageNotifed
		}),
		[notification, deleteNotify, setMessageNotifedId, idMessageNotifed]
	);
}
