import { eventManagementActions, selectAllEventManagement, selectChannelById, selectNumberEvent, useAppDispatch } from "@mezon/store";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

export function useEventManagement(){
    const dispatch = useAppDispatch();
    const allEventManagement = useSelector(selectAllEventManagement);
	const numberEventManagement = useSelector(selectNumberEvent);

    const createEventManagement = useCallback(
		async (clan_id: string, channel_id: string, address: string, title: string, start_time: string, end_time:string, description: string, logo:string) => {
			await dispatch(eventManagementActions.fetchCreateEventManagement({ clan_id, channel_id, address, title, start_time, end_time, description, logo }));
			await dispatch(eventManagementActions.fetchEventManagement({ clanId: clan_id }));
		},
		[dispatch],
	);

    return useMemo(
		() => ({
			allEventManagement,
			numberEventManagement,
            createEventManagement,
		}),
		[
            allEventManagement,
			numberEventManagement,
            createEventManagement,
        ],
	);
}