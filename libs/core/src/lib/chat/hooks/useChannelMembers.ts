import {
	channelMetaActions,
	ChannelsEntity,
	channelUsersActions,
	selectAllChannelMembers,
	selectAllRolesClan,
	selectChannelById,
	ThreadsEntity,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { IMentionOnMessage, uniqueUsers } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export type useChannelMembersOptions = {
	channelId?: string | null;
	mode: number;
};

export function useChannelMembers({ channelId, mode }: useChannelMembersOptions) {
	const channel = useSelector(selectChannelById(channelId ?? ''));
	const membersOfChild = useAppSelector((state) => (channelId ? selectAllChannelMembers(state, channelId as string) : null));
	const membersOfParent = useAppSelector((state) => (channel?.parrent_id ? selectAllChannelMembers(state, channel.parrent_id as string) : null));
	const rolesClan = useSelector(selectAllRolesClan);

	const dispatch = useAppDispatch();

	const updateChannelUsers = async (currentChannel: ChannelsEntity | null, userIds: string[], clanId: string) => {
		const timestamp = Date.now() / 1000;

		const body = {
			channelId: currentChannel?.channel_id as string,
			channelType: currentChannel?.type,
			userIds: userIds,
			clanId: clanId
		};

		await dispatch(channelUsersActions.addChannelUsers(body));
		dispatch(
			channelMetaActions.updateBulkChannelMetadata([
				{
					id: currentChannel?.channel_id ?? '',
					lastSeenTimestamp: timestamp,
					lastSentTimestamp: timestamp,
					lastSeenPinMessage: '',
					clanId: currentChannel?.clan_id ?? ''
				}
			])
		);
	};

	const addMemberToThread = useCallback(
		async (currentChannel: ChannelsEntity | null, mentions: IMentionOnMessage[]) => {
			const userIds = await uniqueUsers(mentions, membersOfChild || [], rolesClan || []);
			if (!userIds || userIds.length === 0) return;
			const notExistingUserIds = userIds.filter((userId) => membersOfParent?.some((member) => member.id === userId));
			if (notExistingUserIds.length > 0 && currentChannel?.clan_id) {
				await updateChannelUsers(currentChannel, notExistingUserIds, currentChannel.clan_id);
			}
		},
		[dispatch, membersOfChild, membersOfParent, rolesClan]
	);

	const joinningToThread = useCallback(
		async (targetThread: ThreadsEntity | null, user: string[]) => {
			await updateChannelUsers(targetThread as ChannelsEntity, user, targetThread?.clan_id as string);
		},
		[dispatch]
	);

	return useMemo(
		() => ({
			membersOfParent: mode === ChannelStreamMode.STREAM_MODE_CHANNEL && channel?.parrent_id !== '0' ? membersOfParent : membersOfChild,
			membersOfChild,
			addMemberToThread,
			joinningToThread
		}),
		[membersOfChild, membersOfParent, mode, channel?.parrent_id, addMemberToThread, joinningToThread]
	);
}
