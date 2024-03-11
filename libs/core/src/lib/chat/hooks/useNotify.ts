import { useAppDispatch } from '@mezon/store';
import { notificationActions, selectAllNotification } from 'libs/store/src/lib/notification/notify.slice';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useNotification() {
	const dispatch = useAppDispatch();
	const notification = useSelector(selectAllNotification);
	const deleteNotify = useCallback(
		(id: string) => {
			const ids= [id]
			dispatch(notificationActions.deleteNotify(ids));
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			notification,
			deleteNotify
		}),
		[notification, deleteNotify],
	);
}
