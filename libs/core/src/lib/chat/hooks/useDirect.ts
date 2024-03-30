import { directActions, selectAllDirectMessages, selectIsLoadDMData, useAppDispatch } from '@mezon/store';

import { ChannelType } from '@mezon/mezon-js';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ApiCreateChannelDescRequest } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

type UseDirectParams = {
	autoFetch: boolean;
};

export function useDirect({ autoFetch = false }: UseDirectParams = { autoFetch: false }) {
	const listDM = useSelector(selectAllDirectMessages);
	const isLoadDM = useSelector(selectIsLoadDMData);
	const dispatch = useAppDispatch();

	const createDirectMessageWithUser = useCallback(
		async (userId: string) => {
			const bodyCreateDm: ApiCreateChannelDescRequest = {
				type: ChannelType.CHANNEL_TYPE_DM,
				channel_private: 1,
				user_ids: [userId],
			};
			const response = await dispatch(directActions.createNewDirectMessage(bodyCreateDm));
			const resPayload = response.payload as ApiCreateChannelDescRequest;

			if (resPayload.channel_id) {
				await dispatch(
					directActions.joinDirectMessage({
						directMessageId: resPayload.channel_id,
						channelName: resPayload.channel_label,
						type: Number(resPayload.type),
					}),
				);
			}

			return resPayload;
		},
		[dispatch],
	);
	const refechDMList = useCallback(() => {
		dispatch(directActions.fetchDirectMessage({}));
	}, [dispatch]);

	useEffect(() => {
		if (isLoadDM || !autoFetch) {
			return;
		}
		refechDMList();
	}, [isLoadDM, refechDMList, autoFetch]);

	return useMemo(
		() => ({
			listDM,
			createDirectMessageWithUser,
			refechDMList,
		}),
		[listDM, createDirectMessageWithUser, refechDMList],
	);
}
