import { selectMaxPermissionForChannel, selectUserMaxPermissionLevel } from '@mezon/store';
import { EOverriddenPermission, EPermission } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIsClanOwner } from '../useIsClanOwner';
import { usePermissionsLevel } from './usePermissionsLevels';

function usePermissionChecker(permissions: EPermission[]): boolean[];
function usePermissionChecker(permissions: Array<EPermission | EOverriddenPermission>, channelId: string): boolean[];

function usePermissionChecker(permissions: string[], channelId?: string) {
	// Retrieve the permission levels for different permission types
	const permissionLevels = usePermissionsLevel();

	// Get the maximum permission level the user has
	const maxPermissionLevel = useSelector(selectUserMaxPermissionLevel);

	// Get the overridden permissions for a specific channel (if channelId is provided)
	const overriddenPermissions = useSelector(selectMaxPermissionForChannel(channelId ?? ''));

	// Check if the user is a Clan Owner, which grants all permissions
	const isClanOwner = useIsClanOwner();

	// Function to check if a user has a particular permission
	const checkPermission = useCallback(
		(permission: string) => {
			// If the permission is an overridden permission for a channel
			if (Object.values(EOverriddenPermission).includes(permission as EOverriddenPermission)) {
				// If no channelId is provided, the check fails for overridden permissions
				if (!channelId) {
					return false;
				}
				// Return the overridden permission for the specific channel
				return overriddenPermissions[permission as unknown as EOverriddenPermission];
			}

			// If user's max permission level is not defined, return false
			if (Number.isNaN(maxPermissionLevel)) {
				return false;
			}

			// Check if the user's max permission level is high enough for the permission
			return permissionLevels[permission as EPermission] <= (maxPermissionLevel as number);
		},
		[channelId, maxPermissionLevel, overriddenPermissions, permissionLevels]
	);

	const results = useMemo(() => {
		// If the user is a Clan Owner, they automatically have all permissions
		if (isClanOwner) {
			return permissions.map(() => true);
		}

		// Map through the permissions array and check each one
		return permissions.map((permission) => checkPermission(permission));
	}, [isClanOwner, permissions, checkPermission]);

	// Return the result array where each entry represents if the user has that permission
	return results;
}

export { usePermissionChecker };
