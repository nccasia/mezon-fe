import {
	ClansEntity,
	clansActions,
	selectAllClans,
	selectAllUsesClan,
	selectCurrentClan,
	selectCurrentClanId,
	selectShowNumEvent,
	useAppDispatch,
	userClanProfileActions,
} from '@mezon/store';
import { UserSearchDataProps } from '@mezon/utils';
import { ApiUpdateClanDescRequest } from 'mezon-js';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useClans() {
	const dispatch = useAppDispatch();
	const clans = useSelector(selectAllClans);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentClan = useSelector(selectCurrentClan);
	const usersClan = useSelector(selectAllUsesClan);
	const showNumEvent = useSelector(selectShowNumEvent(currentClanId || ''));

	const setClanShowNumEvent = React.useCallback(
		async (status: boolean) => {
			await dispatch(clansActions.setClanShowNumEvent({ clanId: currentClanId || '', status }));
		},
		[dispatch, currentClanId],
	);

	const changeCurrentClan = React.useCallback(
		async (clanId: string) => {
			await dispatch(clansActions.changeCurrentClan({ clanId }));
		},
		[dispatch],
	);

	const getUserClanProfile = React.useCallback(
		async (clanId: string) => {
			await dispatch(userClanProfileActions.fetchUserClanProfile({ clanId }));
		},
		[dispatch],
	);

	const updateUserClanProfile = React.useCallback(
		async (clanId: string, name: string, logoUrl: string) => {
			const action = await dispatch(
				userClanProfileActions.updateUserClanProfile({
					clanId,
					username: name,
					avatarUrl: logoUrl,
				}),
			);
			const payload = action.payload;
			return payload;
		},
		[dispatch],
	);

	const createClans = React.useCallback(
		async (name: string, logoUrl: string) => {
			const action = await dispatch(clansActions.createClan({ clan_name: name, logo: logoUrl }));
			const payload = action.payload as ClansEntity;
			if (payload?.clan_id) {
				changeCurrentClan(payload?.clan_id);
			}
			return payload;
		},
		[changeCurrentClan, dispatch],
	);

	const updateClan = React.useCallback(
		async ({ clan_id, banner, clan_name, creator_id, logo }: ApiUpdateClanDescRequest) => {
			await dispatch(clansActions.updateClan({ clan_id, banner, clan_name, creator_id, logo }));
		},
		[dispatch],
	);
	
	const deleteClan = React.useCallback(
		async({ clanId } : {clanId: string}) =>{
			await dispatch(clansActions.deleteClan({clanId}));
		},
		[dispatch],
	);

	const avatarClans = usersClan.map((user) => user.user?.avatar_url).slice(0, 5);

	const remainingMember = usersClan.map((user) => user.user).slice(5);

	const listUserSearch: UserSearchDataProps[] = usersClan.map((user) => {
		return {
			id: user?.user?.id ?? '',
			display: user?.user?.username ?? '',
			avatarUrl: user?.user?.avatar_url ?? '',
		};
	});

	return useMemo(
		() => ({
			clans,
			currentClanId,
			currentClan,
			usersClan,
			avatarClans,
			remainingMember,
			listUserSearch,
			showNumEvent,
			setClanShowNumEvent,
			getUserClanProfile,
			updateUserClanProfile,
			createClans,
			updateClan,
			deleteClan,
		}),
		[
			clans,
			currentClanId,
			currentClan,
			usersClan,
			avatarClans,
			remainingMember,
			listUserSearch,
			showNumEvent,
			setClanShowNumEvent,
			getUserClanProfile,
			updateUserClanProfile,
			createClans,
			updateClan,
			deleteClan,
		],
	);
}
