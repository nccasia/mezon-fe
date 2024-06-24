import { ChannelType } from 'mezon-js';
import { InputField } from '@mezon/ui';
import { ChannelStatusEnum, IChannel } from '@mezon/utils';
import * as Icons from '../../../Icons';
import { useRoles } from '@mezon/core';
import { useMemo, useState } from 'react';
import { channelUsersActions, selectAllRolesClan, selectAllUsesClan, selectCurrentClanId, selectMembersByChannelId, selectRolesByChannelId, useAppDispatch } from '@mezon/store';
import { useSelector } from 'react-redux';
interface AddMemRoleProps {
	onClose: () => void;
	channel: IChannel;
}

export const AddMemRole: React.FC<AddMemRoleProps> = ({ onClose, channel }) => {
	const isPrivate = channel.channel_private;
	const RolesClan = useSelector(selectAllRolesClan);
	const currentClanId = useSelector(selectCurrentClanId);
	const RolesChannel = useSelector(selectRolesByChannelId(channel.id));
	const RolesAddChannel = RolesChannel.filter((role) =>typeof role.role_channel_active === 'number' && role.role_channel_active === 1);
	const RolesNotAddChannel = RolesClan.filter(role => !RolesAddChannel.map(RoleAddChannel => RoleAddChannel.id).includes(role.id));
	
	const usersClan = useSelector(selectAllUsesClan);
	const rawMembers = useSelector(selectMembersByChannelId(channel.id));
	const listUserInvite = useMemo(() => {
		const memberIds = rawMembers.filter(member => member.userChannelId !== "0").map(member => member.user?.id);
		return usersClan.filter(user => !memberIds.some(userId => userId === user.id));
	}, [usersClan, rawMembers]);  
	const listMembersNotInChannel = listUserInvite ? listUserInvite.map(member => member.user):[];
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
	const dispatch = useAppDispatch();
	const handleCheckboxUserChange = (event: React.ChangeEvent<HTMLInputElement>, userId: string) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserIds(prevIds => [...prevIds, userId]);
        } else {
            setSelectedUserIds(prevIds => prevIds.filter(id => id !== userId));
        }
    };
	const handleCheckboxRoleChange = (event: React.ChangeEvent<HTMLInputElement>, roleId:string) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRoleIds(prevIds => [...prevIds, roleId]);
        } else {
            setSelectedRoleIds(prevIds => prevIds.filter(id => id !== roleId));
        }
    };
	
	const handleAddMember = async () => {
		onClose();
		if(selectedUserIds.length > 0){
			const body = {
				channelId: channel.id,
				channelType: channel.type,
				userIds: selectedUserIds,
			};
			await dispatch(channelUsersActions.addChannelUsers(body));
		}
		if (selectedRoleIds.length > 0) {
			const body = {
				clanId: currentClanId || '',
				channelId: channel.id,
				roleIds: selectedRoleIds,
				channelType: channel.type,
			};
			await dispatch(channelUsersActions.addChannelRoles(body));
		}
	};
	
	return (
		<div className="fixed  inset-0 flex items-center justify-center z-50 text-white">
			<div className="fixed inset-0 bg-black opacity-80"></div>
			<div className="relative z-10 dark:bg-bgDisable bg-bgLightMode dark:text-textDarkTheme text-textLightTheme p-6 rounded-[5px] w-[440px] text-[15px]">
				<h2 className="text-[24px] font-semibold text-center">Add members or roles</h2>
				<div className="flex justify-center">
					{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
						<Icons.SpeakerLocked defaultSize="w-5 h-5" />
					)}
					{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
						<Icons.HashtagLocked defaultSize="w-5 h-5 " />
					)}
					{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
					{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-5 h-5" />}
					<p className="text-[#AEAEAE] text-[16px]" style={{ wordBreak: 'break-word' }}>
						{channel.channel_label}
					</p>
				</div>
				<div className="py-3">
					<InputField type="text" placeholder="enter" className="bg-black pl-3 py-[6px] w-full border-0 outline-none rounded" />
					<p className="text-xs pt-2">Add individual members by starting with @ or type a role name</p>
				</div>
				<div className="max-h-[270px] overflow-y-scroll hide-scrollbar">
					<div>
						<p className="uppercase font-bold text-xs pb-4">Roles</p>
						<div>
							{RolesNotAddChannel.map((role, index) => (
								<div className={`flex justify-between py-2 'hover:bg-[#43444B] px-[6px]' rounded`} key={role.id}>
									<div className="flex gap-x-2 items-center">
											<input
												id={`checkbox-item-${index}`}
												type="checkbox"
												value={role.title}
												onChange={(event) => handleCheckboxRoleChange(event, role?.id || '')}
												className="peer relative appearance-none w-5 h-5 border rounded-sm focus:outline-none checked:bg-gray-300"
											></input>
										<Icons.RoleIcon defaultSize="w-[23px] h-5" />
										<p className="text-sm">{role.title}</p>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="mt-2">
						<p className="uppercase font-bold text-xs pb-4">Members</p>
						<div>
							{listMembersNotInChannel.map((user) => (
								<div className={`flex justify-between py-2 rounded hover:bg-[#43444B] px-[6px]`} key={user?.id}>
									<div className="flex gap-x-2 items-center">
										<input
											type="checkbox"
											value={user?.display_name}
											onChange={(event) => handleCheckboxUserChange(event, user?.id || '')}
											className="peer relative appearance-none w-5 h-5 border rounded-sm focus:outline-none checked:bg-gray-300"
										/>
										<img src={user?.avatar_url} alt={user?.display_name} className="size-6 object-cover rounded-full" />
										<p className="text-sm">{user?.display_name}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="flex justify-center mt-10 text-[14px]">
					<button
						color="gray"
						onClick={onClose}
						className="px-4 py-2 mr-5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300"
					>
						Cancel
					</button>
					<button
						color="blue"
						onClick={handleAddMember}
						className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring focus:border-blue-300"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
};
