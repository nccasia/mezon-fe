import { useAuth } from '@mezon/core';
import { channelUsersActions, clansActions, selectCurrentClanId, selectMembersByChannelId, selectRolesByChannelId, useAppDispatch } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from '../../../Icons';
import { AddMemRole } from '../Modal/addMemRoleModal';
import ModalAskChangeChannel from '../Modal/modalAskChangeChannel';

export type PermissionsChannelProps = {
	channel: IChannel;
};

const PermissionsChannel = (props: PermissionsChannelProps) => {
	const { channel } = props;
	const [showAddMemRole, setShowAddMemRole] = useState(false);
	const [valueToggleInit, setValueToggleInit] = useState(channel.channel_private === undefined);
	const [valueToggle, setValueToggle] = useState(valueToggleInit);
	const rawMembers = useSelector(selectMembersByChannelId(channel.id));

	const { userProfile } = useAuth();
	const currentClanId = useSelector(selectCurrentClanId);
	const RolesChannel = useSelector(selectRolesByChannelId(channel.id));
	const dispatch = useAppDispatch();
	const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValueToggle(!valueToggle);
	};

	const handleReset = () => {
		setValueToggle(valueToggleInit);
	};

	const handleSave = () => {
		setValueToggleInit(valueToggle);
	};

	const openAddMemRoleModal = () => {
		setShowAddMemRole(true);
	};
	const listMembersInChannel = useMemo(() => {
		if (!rawMembers) return [];
		const filteredMembers = rawMembers.filter((member) => member.userChannelId !== '0');
		return filteredMembers.map((member) => member.user);
	}, [rawMembers]);

	const listRolesInChannel = useMemo(() => {
		if (!RolesChannel) return [];
		return RolesChannel.filter((role) => typeof role.role_channel_active === 'number' && role.role_channel_active === 1);
	}, [RolesChannel]);

	const closeAddMemRoleModal = () => {
		setShowAddMemRole(false);
	};

	const checkOwner = (userId: string) => {
		return userId === userProfile?.user?.google_id;
	};

	const deleteMember = async (userId: string) => {
		if (userId !== userProfile?.user?.id) {
			const body = {
				channelId: channel.id,
				userId: userId,
			};
			await dispatch(channelUsersActions.removeChannelUsers(body));
		}
	};

	const deleteRole = async (roleId: string) => {
		const body = {
			channelId: channel.id,
			clanId: currentClanId || '',
			roleId: roleId,
			channelType: channel.type,
		};
		await dispatch(channelUsersActions.removeChannelRole(body));
	};

	return (
		<>
			<div className="overflow-y-auto flex flex-col flex-1 shrink dark:bg-bgPrimary bg-bgLightModeSecond w-1/2 pt-[94px] sbm:pb-7 sbm:pr-[10px] sbm:pl-[40px] p-4 overflow-x-hidden min-w-full sbm:min-w-[700px] 2xl:min-w-[900px] max-w-[740px] hide-scrollbar relative">
				<div className="dark:text-white text-[15px] text-black">
					<h3 className="mb-4 font-bold">Channel Permissions</h3>
					<p className="mb-3">Use permissions to customise who can do what in this channel.</p>
					<div className="flex mt-4 p-4">
						<Icons.SyncIcon defaultFill="#F0B033" defaultSize="mr-2" />
						<p>Permissions synced with category: </p>
						<p className="font-bold pl-1"> {channel.category_name}</p>
					</div>
					<div className="rounded-md overflow-hidden mt-4">
						<div className="dark:bg-black bg-white flex justify-between items-start p-4">
							<div>
								<div className="inline-flex mb-2">
									<Icons.LockIcon />
									<p className="ml-2 font-bold">Private Channel</p>
								</div>
								<p className="text-xs">
									By making a channel private, only select members and roles will be able to view this channel.
								</p>
							</div>
							<input
								className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg
               bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full
                after:bg-slate-500 after:transition-all checked:bg-blue-200 checked:after:left-4 checked:after:bg-blue-500
                 hover:bg-slate-400 after:hover:bg-slate-600 checked:hover:bg-blue-300 checked:after:hover:bg-blue-600
                  focus:outline-none checked:focus:bg-blue-400 checked:after:focus:bg-blue-700 focus-visible:outline-none disabled:cursor-not-allowed
                   disabled:bg-slate-200 disabled:after:bg-slate-300"
								type="checkbox"
								checked={!valueToggle}
								id="id-c01"
								onChange={handleToggle}
							/>
						</div>
						{!valueToggle && (
							<div className="p-4 dark:bg-[#0B0B0B] bg-white">
								<div className="flex justify-between items-center pb-4">
									<p className="uppercase font-bold text-xs">Who can access this channel?</p>
									<button className="bg-[#155EEF] hover:bg-blue-500 px-4 py-1 rounded text-white" onClick={openAddMemRoleModal}>
										Add members or roles
									</button>
								</div>
								<hr className="border-t border-solid border-borderDefault" />
								<div className="py-4">
									<p className="uppercase font-bold text-xs pb-4">Roles</p>
									<div>
										{listRolesInChannel.map((role) => (
											<div className={`flex justify-between py-2 rounded`} key={role.id}>
												<div className="flex gap-x-2 items-center">
													<Icons.RoleIcon defaultSize="w-[23px] h-5" />
													<p className="text-sm">{role.title}</p>
												</div>
												<div className="flex items-center gap-x-2">
													<p className="text-xs text-[#AEAEAE]">Role</p>
													<div onClick={() => deleteRole(role?.id || '')} role="button">
														<Icons.EscIcon defaultSize="size-[15px] cursor-pointer" />
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
								<hr className="border-t border-solid border-borderDefault" />
								<div className="py-4">
									<p className="uppercase font-bold text-xs pb-4">Members</p>
									<div>
										{listMembersInChannel.map((user) => (
											<div className={`flex justify-between py-2 rounded`} key={user?.id}>
												<div className="flex gap-x-2 items-center">
													<img
														src={user?.avatar_url}
														alt={user?.display_name}
														className="size-6 object-cover rounded-full"
													/>
													<p className="text-sm">{user?.display_name}</p>
												</div>
												<div className="flex items-center gap-x-2">
													<p className="text-xs text-[#AEAEAE]">
														{checkOwner(user?.google_id || '') ? 'Clan Owner' : ''}
													</p>
													<div onClick={() => deleteMember(user?.id || '')} role="button">
														<Icons.EscIcon
															defaultSize={`${checkOwner(user?.google_id || '') ? '' : 'cursor-pointer'} size-[15px]`}
															defaultFill={`${checkOwner(user?.google_id || '') ? '#4C4D55' : '#AEAEAE'}`}
														/>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
				{valueToggleInit !== valueToggle && (
					<ModalAskChangeChannel onReset={handleReset} onSave={handleSave} className="relative mt-8 bg-transparent pr-0" />
				)}
			</div>
			{showAddMemRole && <AddMemRole onClose={closeAddMemRoleModal} channel={channel} />}
		</>
	);
};

export default PermissionsChannel;
