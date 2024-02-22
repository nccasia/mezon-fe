import { directActions, selectAllDirectMessages, useAppDispatch } from '@mezon/store';
import { ChannelTypeEnum } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ApiCreateChannelDescRequest } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

export function useDirect() {
	const listDM = useSelector(selectAllDirectMessages);
	const dispatch = useAppDispatch();

	const createDirectMessageWithUser = useCallback(
		async (userId: string) => {
			const bodyCreateDmGroup: ApiCreateChannelDescRequest = {
				type: ChannelTypeEnum.DM_CHAT,
				channel_private: 1,
				user_ids: [userId],
			};
			const response = await dispatch(directActions.createNewDirectMessage(bodyCreateDmGroup));
			const resPayload = response.payload as ApiCreateChannelDescRequest;

			if (resPayload.channel_id) {
				await dispatch(
					directActions.joinDirectMessage({
						directMessageId: resPayload.channel_id,
						channelName: resPayload.channel_lable,
						type: Number(resPayload.type),
					}),
				);
			}

			return resPayload;
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			listDM,
			createDirectMessageWithUser,
		}),
		[listDM, createDirectMessageWithUser],
	);
}
