import { AvatarImage, Icons } from '@mezon/components';
import { useCheckOwnerForUser } from '@mezon/core';
import {
	channelUsersActions,
	removeChannelUsersPayload,
	selectAllAccount,
	selectAllUserChannel,
	selectCurrentClanId,
	useAppDispatch
} from '@mezon/store';
import { IChannel, getAvatarForPrioritize, getNameForPrioritize } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
type ListMemberPermissionProps = {
	channel: IChannel;
	selectedUserIds: string[];
};

const ListMemberPermission = (props: ListMemberPermissionProps) => {
	const { channel } = props;
	const dispatch = useAppDispatch();
	const userProfile = useSelector(selectAllAccount);

	const rawMembers = useSelector(selectAllUserChannel);
	const currentClanId = useSelector(selectCurrentClanId);

	const deleteMember = async (userId: string) => {
		if (userId !== userProfile?.user?.id) {
			const body: removeChannelUsersPayload = {
				channelId: channel.id,
				userId: userId,
				channelType: channel.type,
				clanId: currentClanId as string
			};
			await dispatch(channelUsersActions.removeChannelUsers(body));
		}
	};

	const listMembersInChannel = useMemo(() => {
		if (channel.channel_private === 0 || channel.channel_private === undefined) {
			const filteredMembers = rawMembers.filter((member) => member.user && member.user.id && props.selectedUserIds.includes(member.user.id));
			return filteredMembers.map((member) => ({ ...member.user, clanNick: member.clan_nick, clanAvatar: member.clan_avatar }));
		}
		const filteredMembers = rawMembers.filter((member) => member.userChannelId !== '0');
		return filteredMembers.map((member) => ({ ...member.user, clanNick: member.clan_nick, clanAvatar: member.clan_avatar }));
	}, [rawMembers]);

	return listMembersInChannel.map((user) => (
		<ItemMemberPermission
			key={user.id}
			id={user.id}
			userName={user.username}
			displayName={user.display_name}
			clanName={user.clanNick}
			clanAvatar={user.clanAvatar}
			avatar={user.avatar_url}
			onDelete={() => deleteMember(user.id as string)}
		/>
	));
};

export default ListMemberPermission;

type ItemMemberPermissionProps = {
	id?: string;
	userName?: string;
	avatar?: string;
	displayName?: string;
	clanName?: string;
	clanAvatar?: string;
	onDelete: () => void;
};

const ItemMemberPermission = (props: ItemMemberPermissionProps) => {
	const { id = '', userName = '', displayName = '', clanName = '', clanAvatar = '', avatar = '', onDelete } = props;
	const [checkClanOwner] = useCheckOwnerForUser();
	const isClanOwner = checkClanOwner(id);
	const namePrioritize = getNameForPrioritize(clanName, displayName, userName);
	const avatarPrioritize = getAvatarForPrioritize(clanAvatar, avatar);

	const handleDelete = () => {
		if (!isClanOwner) {
			onDelete();
		}
	};

	return (
		<div className={`flex justify-between py-2 rounded`} key={id}>
			<div className="flex gap-x-2 items-center">
				<AvatarImage
					alt={userName}
					userName={userName}
					className="min-w-6 min-h-6 max-w-6 max-h-6"
					src={avatarPrioritize}
					classNameText="text-[9px] pt-[3px]"
				/>
				<p className="text-sm font-semibold">{namePrioritize}</p>
				<p className="text-contentTertiary font-light">{userName}</p>
			</div>
			<div className="flex items-center gap-x-2">
				<p className="text-xs text-[#AEAEAE]">{isClanOwner && 'Clan Owner'}</p>
				<div onClick={handleDelete} role="button">
					<Icons.EscIcon
						defaultSize={`${isClanOwner ? 'cursor-not-allowed' : 'cursor-pointer'} size-[15px]`}
						defaultFill={isClanOwner ? '#4C4D55' : '#AEAEAE'}
					/>
				</div>
			</div>
		</div>
	);
};
