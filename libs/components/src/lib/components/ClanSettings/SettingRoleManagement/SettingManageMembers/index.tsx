import { useClans, useRoles } from '@mezon/core';
import { getNewAddMembers, getSelectedRoleId, setAddMemberRoles } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddMembersModal } from '../AddMembersModal';
import { UsersClanEntity } from '@mezon/utils';

const SettingManageMembers = () => {
	const { RolesClan, updateRole } = useRoles();
	const dispatchRole = useDispatch();
	const { currentClan } = useClans();
	const addUsers: string[] = useSelector(getNewAddMembers);
	const clickRole = useSelector(getSelectedRoleId);
	const { usersClan } = useClans();
	const [searchTerm, setSearchTerm] = useState('');
	const [openModal, setOpenModal] = useState<boolean>(false);
	const activeRole = RolesClan.find((role) => role.id === clickRole);
	const commonUsers = usersClan.filter((user) => addUsers.includes(user.id));

	const [searchResults, setSearchResults] = useState<any[]>(commonUsers);
	const handleOpenModal = () => {
		setOpenModal(true);
	};

	const handleCloseModal = () => {
		setOpenModal(false);
	};

	useEffect(() => {
		const results = commonUsers?.filter((member) => member.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()));
		setSearchResults(results || []);
	}, [searchTerm, addUsers, clickRole]);

	useEffect(() => {
		if (clickRole !== 'New Role') {
			const memberIDRoles = activeRole?.role_user_list?.role_users?.map((member) => member.id) || [];
			dispatchRole(setAddMemberRoles(memberIDRoles));
		}
	}, [activeRole]);

	const handleRemoveMember = async (userID: string) => {
		const userIDArray = userID?.split(',');
		await updateRole(currentClan?.id ?? '', clickRole, activeRole?.title ?? '', [], [], userIDArray, []);
	};
	return (
		<>
			<div className="w-full flex gap-x-3">
				<input
					className="flex-grow dark:bg-black bg-white p-[7px] border rounded-lg font-normal"
					type="text"
					placeholder="Search Members"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<button
					className="flex-grow bg-blue-500 hover:bg-blue-400 text-white p-[7px] rounded-lg font-normal"
					onClick={() => {
						handleOpenModal();
					}}
				>
					Add Members
				</button>
			</div>
			<br />
			<div>
				<ul className="flex flex-col gap-y-[5px]">
					{searchResults.map((member: UsersClanEntity) => (
						<li key={member?.user?.id} className="flex justify-between items-center group">
							<div className='flex gap-x-2'>
								<img src={member?.user?.avatar_url} alt={member?.user?.display_name} className='size-6 rounded-full' />
								<span className='dark:text-white text-black'>{member?.user?.display_name}</span>
								<span className='dark:text-colorNeutral text-colorTextLightMode font-medium'>{member?.user?.username}</span>
							</div>
							{clickRole !== 'New Role' ? (
								<div className="w-4 h-4 rounded-full flex justify-center items-center group-hover:bg-slate-800">
									<span onClick={() => handleRemoveMember(member?.user?.id || '')} className="text-white cursor-pointer" role="button">
										x
									</span>
								</div>
							) : null}
						</li>
					))}
				</ul>
			</div>
			<AddMembersModal isOpen={openModal} onClose={handleCloseModal} />
		</>
	);
};

export default SettingManageMembers;
