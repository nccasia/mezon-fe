import { channelsActions, directActions, useAppDispatch } from "@mezon/store";
import { ChannelType } from "mezon-js";
import { ApiCreateChannelDescRequest } from "mezon-js/api.gen";
import { useCallback, useMemo } from "react";

export function useSilentSendMess () {
    const dispatch = useAppDispatch();
    const createSilentSendMess = useCallback(
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
					channelsActions.joinChat({
						clanId: resPayload.clan_id || '',
                        channelId: resPayload.channel_id || '',
                        channelType: ChannelType.CHANNEL_TYPE_DM,
					})
				);
			}

			return resPayload;
		},
		[dispatch],
    );

    return useMemo(
        () =>({
            createSilentSendMess
        }), 
        [
            createSilentSendMess
        ]
    )
}