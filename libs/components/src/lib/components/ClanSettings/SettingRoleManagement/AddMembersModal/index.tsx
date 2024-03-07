import { useClans, useRoles } from '@mezon/core';
import { getNewAddMembers, getSelectedRoleId, setAddMemberRoles } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const AddMembersModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
	const { RolesClan, updateRole } = useRoles();
	const dispatch = useDispatch();
	const [searchTerm, setSearchTerm] = useState('');
	const { usersClan, currentClan } = useClans();
	const addUsers = useSelector(getNewAddMembers);

	const clickRole = useSelector(getSelectedRoleId);
	const activeRole = RolesClan.find((role) => role.id === clickRole);
	const memberRoles = activeRole?.role_user_list?.role_users;
	const membersNotInRoles = usersClan.filter((member) => {
		return !memberRoles || !memberRoles.some((roleMember) => roleMember.id === member.id);
	});

	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

	useEffect(() => {
		if (isOpen) {
			const filteredMemberIds = membersNotInRoles.filter((member) => addUsers.includes(member.id)).map((member) => member.id);
			setSelectedUsers(filteredMemberIds);
		}
	}, [isOpen]);

	const [searchResults, setSearchResults] = useState<any[]>([]);

	useEffect(() => {
		setSearchResults(membersNotInRoles);
	}, [clickRole]);

	const handleUserToggle = (permissionId: string) => {
		setSelectedUsers((prevPermissions) => {
			if (prevPermissions.includes(permissionId)) {
				return prevPermissions.filter((id) => id !== permissionId);
			} else {
				return [...prevPermissions, permissionId];
			}
		});
	};

	useEffect(() => {
		const results = membersNotInRoles.filter((member) => member.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()));
		setSearchResults(results);
	}, [searchTerm]);

	const handleUpdateRole = async () => {
		if (clickRole === 'New Role') {
			dispatch(setAddMemberRoles(selectedUsers));
		} else {
			await updateRole(currentClan?.id ?? '', clickRole, '', selectedUsers, [], [], []);
		}
	};

	return (
		isOpen && (
			<div className="fixed  inset-0 flex items-center justify-center z-50">
				<div className="fixed inset-0 bg-black opacity-80"></div>
				<div className="relative z-10 dark:bg-gray-900 bg-[#151515] p-6 rounded-[5px] text-center h-[400px] w-[530px] flex flex-col justify-between gap-y-2">
					<div>
						<h2 className="text-[30px] font-semibold">Add members</h2>
						<p className="text-white-600 text-[16px] mb-4">{activeRole?.title}</p>
						<div className="w-full flex mb-3">
							<input
								className="flex-grow bg-black p-[7px] pl-3 border rounded-lg"
								type="text"
								placeholder="Search Permissions"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="overflow-y-auto">
							<ul className="flex flex-col gap-y-[5px] max-h-[200px]">
								{searchResults.map((permission) => (
									<li key={permission.id} className="flex items-center justify-between">
										<span>{permission?.user?.display_name}</span>
										<label>
											<input
												type="checkbox"
												checked={selectedUsers.includes(permission.id)}
												onChange={() => handleUserToggle(permission.id)}
											/>
										</label>
									</li>
								))}
							</ul>
						</div>
					</div>
					<div className="flex justify-center text-[14px] gap-x-7">
						<button
							color="gray"
							onClick={onClose}
							className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300"
						>
							Cancel
						</button>
						<button
							color="blue"
							className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring focus:border-blue-300"
							onClick={() => {
								handleUpdateRole();
								onClose();
							}}
						>
							Add
						</button>
					</div>
				</div>
			</div>
		)
	);
};
