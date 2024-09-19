import { AvatarImage, Icons } from '@mezon/components';
import { useRoles } from '@mezon/core';
import {
	RolesClanEntity,
	UsersClanEntity,
	getNewAddMembers,
	getSelectedRoleId,
	selectAllUserClans,
	selectCurrentClan,
	selectTheme,
	setAddMemberRoles
} from '@mezon/store';
import { InputField } from '@mezon/ui';
import { ThemeApp, getAvatarForPrioritize, getNameForPrioritize } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface ModalProps {
	isOpen: boolean;
	RolesClan: RolesClanEntity[];
	onClose: () => void;
}

export const AddMembersModal: React.FC<ModalProps> = ({ isOpen, RolesClan, onClose }) => {
	const { updateRole } = useRoles();
	const dispatch = useDispatch();
	const [searchTerm, setSearchTerm] = useState('');
	const currentClan = useSelector(selectCurrentClan);
	const usersClan = useSelector(selectAllUserClans);
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
	}, [isOpen, memberRoles]);

	const [searchResults, setSearchResults] = useState<UsersClanEntity[]>([]);

	useEffect(() => {
		setSearchResults(membersNotInRoles);
	}, [clickRole, memberRoles, membersNotInRoles]);

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
		const results = membersNotInRoles.filter((member) => {
			const clanName = member?.clan_nick?.toLowerCase();
			const displayName = member.user?.display_name?.toLowerCase();
			const userName = member.user?.username?.toLowerCase();
			const lowerCaseSearchTerm = searchTerm.toLowerCase();
			return clanName?.includes(lowerCaseSearchTerm) || displayName?.includes(lowerCaseSearchTerm) || userName?.includes(lowerCaseSearchTerm);
		});
		setSearchResults(results);
	}, [searchTerm]);

	const handleUpdateRole = async () => {
		if (clickRole === 'New Role') {
			dispatch(setAddMemberRoles(selectedUsers));
		} else {
			await updateRole(currentClan?.id ?? '', clickRole, activeRole?.title ?? '', selectedUsers, [], [], []);
		}
	};

	const appearanceTheme = useSelector(selectTheme);

	return (
		isOpen && (
			<div
				className={`fixed  inset-0 flex items-center justify-center z-50 ${appearanceTheme === ThemeApp.Light && 'lightModeScrollBarMention'}`}
			>
				<div className="fixed inset-0 bg-black opacity-80"></div>
				<div className="relative z-10 dark:bg-bgDisable bg-bgLightMode p-6 rounded-[5px] text-center w-[440px] flex flex-col justify-between gap-y-2">
					<div>
						<h2 className="text-2xl font-semibold">Add members</h2>
						<p className="text-contentTertiary text-[16px] mb-4 font-light inline-flex gap-x-2 items-center">
							<Icons.RoleIcon defaultSize="w-5 h-[30px] min-w-5" />
							{activeRole?.title}
						</p>
						<div className="w-full flex mb-3">
							<InputField
								className="flex-grow rounded w-full dark:text-white text-black border dark:border-black border-white p-2 focus:outline-none focus:border-white-500 dark:bg-bgTertiary bg-bgLightModeThird text-base"
								type="text"
								placeholder="Search Permissions"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<p className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase mb-2 text-left">Members</p>
						<div className="overflow-y-auto">
							<ul className="flex flex-col gap-y-[5px] max-h-[200px] font-light text-sm ">
								{searchResults.map((permission) => (
									<ItemMemberModal
										key={permission?.id}
										id={permission?.id}
										userName={permission?.user?.username}
										displayName={permission?.user?.display_name}
										clanName={permission?.clan_nick}
										clanAvatar={permission.clan_avatar}
										avatar={permission?.user?.avatar_url}
										checked={selectedUsers.includes(permission.id)}
										onHandle={() => handleUserToggle(permission.id)}
									/>
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

type ItemMemberModalProps = {
	id?: string;
	userName?: string;
	displayName?: string;
	clanName?: string;
	clanAvatar?: string;
	avatar?: string;
	checked: boolean;
	onHandle: () => void;
};

const ItemMemberModal = (props: ItemMemberModalProps) => {
	const { id = '', userName = '', displayName = '', clanName = '', clanAvatar = '', avatar = '', checked, onHandle } = props;
	const namePrioritize = getNameForPrioritize(clanName, displayName, userName);
	const avatarPrioritize = getAvatarForPrioritize(clanAvatar, avatar);
	return (
		<li key={id}>
			<label htmlFor={id} className="w-full inline-flex justify-between items-center">
				<div className="inline-flex gap-x-2">
					<AvatarImage
						alt={userName}
						userName={userName}
						className="min-w-5 min-h-5 max-w-5 max-h-5"
						src={avatarPrioritize}
						classNameText="text-[9px] pt-[3px]"
					/>
					<p className="font-semibold one-line">{namePrioritize}</p>
					<p className="text-contentTertiary one-line">{userName}</p>
				</div>
				<input id={id} type="checkbox" checked={checked} onChange={onHandle} />
			</label>
		</li>
	);
};
