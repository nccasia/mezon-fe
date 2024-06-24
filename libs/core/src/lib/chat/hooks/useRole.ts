import { channelMembersActions, rolesClanActions, useAppDispatch } from '@mezon/store';
import { ChannelType } from 'mezon-js';
import React, { useMemo } from 'react';
export function useRoles(channelID?: string) {
	const dispatch = useAppDispatch();
	const deleteRole = React.useCallback(
		async (roleId: string) => {
			await dispatch(rolesClanActions.fetchDeleteRole({ roleId }));
		},
		[dispatch],
	);

	const createRole = React.useCallback(
		async (clan_id: string, clanId: string, title: string, add_user_ids: string[], active_permission_ids: string[]) => {
			await dispatch(rolesClanActions.fetchCreateRole({ clan_id, title, add_user_ids, active_permission_ids }));
			await dispatch(rolesClanActions.fetchRolesClan({ clanId }));
		},
		[dispatch],
	);

	const updateRole = React.useCallback(
		async (
			clanId: string,
			role_id: string,
			title: string,
			add_user_ids: string[],
			active_permission_ids: string[],
			remove_user_ids: string[],
			remove_permission_ids: string[],
		) => {
			await dispatch(
				rolesClanActions.fetchUpdateRole({ role_id, title, add_user_ids, active_permission_ids, remove_user_ids, remove_permission_ids }),
			);
			await dispatch(rolesClanActions.fetchRolesClan({ clanId }));
			await dispatch(
				channelMembersActions.fetchChannelMembers({
					clanId: clanId,
					channelId: channelID || '',
					channelType: ChannelType.CHANNEL_TYPE_TEXT,
					noCache: true,
					repace: true,
				}),
			);
		},
		[dispatch],
	);
	return useMemo(
		() => ({
			deleteRole,
			createRole,
			updateRole,
		}),
		[deleteRole, createRole, updateRole],
	);
}
