import { selectMaxPermissionForChannel } from '@mezon/store';
import { useSelector } from 'react-redux';

/**
 * get permissions for channel
 * @usage
 * ```tsx
 * const { maxChannelPermissions } = useChannelRestriction('channel-id');
 * // check permission for send message
 * maxChannelPermissions[EOverriddenPermission.sendMessage] // return true/false
 * ```
 * @param channelId id of channel
 * @returns
 */
export const useChannelRestriction = (channelId: string) => {
	const maxChannelPermissions = useSelector(selectMaxPermissionForChannel(channelId));
	return { maxChannelPermissions };
};
