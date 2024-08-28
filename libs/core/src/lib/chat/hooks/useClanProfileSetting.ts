import { selectUserClanProfileByClanID, useAppDispatch, userClanProfileActions } from '@mezon/store';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

export type useProfileClanOptions = {
	clanId: string;
};

export function useClanProfileSetting({ clanId }: useProfileClanOptions) {
	const dispatch = useAppDispatch();
	const { userProfile } = useAuth();

	const clanProfile = useSelector(selectUserClanProfileByClanID(clanId, userProfile?.user?.id || ''));

	const updateUserClanProfile = React.useCallback(
		async (clanId: string, name: string, logoUrl: string) => {
			const action = await dispatch(userClanProfileActions.updateUserClanProfile({ clanId, username: name, avatarUrl: logoUrl }));
			const payload = action.payload;
			return payload;
		},
		[dispatch]
	);

	useEffect(() => {
		if (!clanProfile) {
			dispatch(userClanProfileActions.fetchUserClanProfile({ clanId }));
		}
	}, [updateUserClanProfile, clanProfile, clanId, dispatch]);

	return {
		updateUserClanProfile,
		clanProfile
	};
}
