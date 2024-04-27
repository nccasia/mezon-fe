import { ClansEntity, clansActions, useAppDispatch } from '@mezon/store';
import React, { useMemo } from 'react';

export function useAccount() {
	const dispatch = useAppDispatch();

	const updateUser = React.useCallback(
		async (name: string, logoUrl: string, displayName: string, aboutMe: string) => {
			const action = await dispatch(
				clansActions.updateUser({
					user_name: name,
					avatar_url: logoUrl,
					display_name: displayName,
					about_me: aboutMe
				}),
			);
			const payload = action.payload as ClansEntity;
			return payload;
		},
		[dispatch],
	);

	return useMemo(
		() => ({
			updateUser,
		}),
		[updateUser],
	);
}
