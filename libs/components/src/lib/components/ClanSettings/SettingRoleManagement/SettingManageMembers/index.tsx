import { useClans, useRoles } from '@mezon/core';
import { getNewAddMembers, getSelectedRoleId } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AddMembersModal } from '../AddMembersModal';

const SettingManageMembers = () => {
	const { updateRole } = useRoles();
	const { currentClan } = useClans();
	const addUsers: string[] = useSelector(getNewAddMembers);
	const clickRole = useSelector(getSelectedRoleId);
	const { usersClan } = useClans();
	const [searchTerm, setSearchTerm] = useState('');
	const [openModal, setOpenModal] = useState<boolean>(false);

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

	const handleRemoveMember = async (userID: string[]) => {
		await updateRole(currentClan?.id ?? '', clickRole, '', [], [], userID, []);
	};
	return (
		<>
			<div className="w-full flex gap-x-3">
				<input
					className="flex-grow bg-black p-[7px] border rounded-lg"
					type="text"
					placeholder="Search Members"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<button
					className="flex-grow bg-blue-500 hover:bg-blue-400 text-white p-[7px] rounded-lg"
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
					{searchResults.map((member: any) => (
						<li key={member.user.id} className="flex justify-between items-center">
							<span>{member.user.display_name}</span>
							{clickRole !== 'New Role' ? (
								<div className="w-4 h-4 rounded-full flex justify-center items-center hover:bg-slate-800">
									<span onClick={() => handleRemoveMember(member.user.id)} className="text-white cursor-pointer">
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
