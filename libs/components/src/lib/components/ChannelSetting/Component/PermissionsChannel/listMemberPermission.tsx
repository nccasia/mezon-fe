import { AvatarImage, Icons } from '@mezon/components';
import { useCheckOwnerForUser } from '@mezon/core';
import { channelUsersActions, selectAllAccount, selectMembersByChannelId, useAppDispatch } from '@mezon/store';
import { getNameForPrioritize, IChannel } from '@mezon/utils';
import { useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';
type ListMemberPermissionProps = {
	channel: IChannel;
	selectedUserIds: string[];
};

const ListMemberPermission = (props: ListMemberPermissionProps) => {
	const { channel } = props;
	const dispatch = useAppDispatch();
	const userProfile = useSelector(selectAllAccount);
	const rawMembers = useSelector(selectMembersByChannelId(channel.id));
	const [memberList, setMemberList] = useState<any[]>();

	const deleteMember = async (userId: string) => {
		if (userId !== userProfile?.user?.id) {
			const body = {
				channelId: channel.id,
				userId: userId,
			};
			await dispatch(channelUsersActions.removeChannelUsers(body));
		}
	};

	const listMembersInChannel = () => {
		if (channel.channel_private === 0 || channel.channel_private === undefined) {
			const filteredMembers = rawMembers.filter((member) => member.user && member.user.id && props.selectedUserIds.includes(member.user.id));
			return filteredMembers.map((member) => ({...member.user, clanNick: member.clan_nick}));
		}
		const filteredMembers = rawMembers.filter((member) => member.userChannelId !== '0');
		return filteredMembers.map((member) => ({...member.user, clanNick: member.clan_nick}));
	};

	useLayoutEffect(() => {
		if (rawMembers) {
			listMembersInChannel();
			setMemberList(listMembersInChannel());
		}
	}, [rawMembers.length, props.selectedUserIds]);

	return memberList?.map((user) => ( 
		<ItemMemberPermission 
			key={user.id}	
			id={user.id}
			userName={user.username}
			displayName={user.display_name}
			clanName={user.clanNick}
			avatar={user.avatar_url}
			onDelete={() => deleteMember(user.id)}
		/>
	));
};

export default ListMemberPermission;

type ItemMemberPermissionProps =  {
	id?: string;
	userName?: string;
	avatar?: string;
	displayName?: string;
	clanName?: string;
	onDelete: () => void;
}

const ItemMemberPermission = (props: ItemMemberPermissionProps) => {
	const {id='', userName='', displayName='', clanName='', avatar='', onDelete} = props;
	const [checkClanOwner] = useCheckOwnerForUser();
	const isClanOwner = checkClanOwner(id);
	const namePrioritize = getNameForPrioritize(clanName, displayName, userName);
	return(
		<div className={`flex justify-between py-2 rounded`} key={id}>
			<div className="flex gap-x-2 items-center">
				<AvatarImage 
					alt={userName}
					userName={userName}
					className="min-w-6 min-h-6 max-w-6 max-h-6"
					src={avatar}
					classNameText='text-[9px] pt-[3px]'
				/>
				<p className="text-sm font-semibold">{namePrioritize}</p>
				<p className='text-contentTertiary font-light'>{userName}</p>
			</div>
			<div className="flex items-center gap-x-2">
				<p className="text-xs text-[#AEAEAE]">
					{isClanOwner && 'Clan Owner'}
				</p>
				<div onClick={!isClanOwner ? () => onDelete() : ()=>{}} role="button">
					<Icons.EscIcon
						defaultSize={`${isClanOwner ? 'cursor-not-allowed' : 'cursor-pointer'} size-[15px]`}
						defaultFill={isClanOwner ? '#4C4D55' : '#AEAEAE'}
					/>
				</div>
			</div>
		</div>
	)
}
