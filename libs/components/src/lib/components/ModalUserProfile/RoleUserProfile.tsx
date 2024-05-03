import { UserRestrictionZone, useClanRestriction, useClans, useRoles } from '@mezon/core';
import { selectCurrentChannelId, selectMemberByUserId } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { ChangeEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type RoleUserProfileProps = {
	userID?: string;
};

const RoleUserProfile = ({ userID }: RoleUserProfileProps) => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const userById = useSelector(selectMemberByUserId(userID ?? ''));

	const { RolesClan, updateRole } = useRoles(currentChannelId || '');
	const { currentClan } = useClans();

	const [searchTerm, setSearchTerm] = useState('');
	const activeRoles = RolesClan.filter((role) => role.active === 1);
	const [showPopupAddRole, setShowPopupAddRole] = useState(false);
	const userRolesClan = useMemo(() => {
		return userById?.role_id ? RolesClan.filter((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, RolesClan]);
	const activeRolesWithoutUserRoles = activeRoles.filter((role) => !userRolesClan.some((userRole) => userRole.id === role.id));

	const [hasManageChannelPermission, { isClanCreator }] = useClanRestriction([EPermission.manageChannel]);

	const [positionTop, setPositionTop] = useState(40);
	const [positionLeft, setPositionLeft] = useState(0);
	const handModalAddRole = (e: any) => {
		setShowPopupAddRole(true);
		const clickY = e.clientY;
		const windowHeight = window.innerHeight;
		const distanceToBottom = windowHeight - clickY;
		const heightModalAddRole = 180;
		if (distanceToBottom < heightModalAddRole) {
			setPositionTop(-50);
			setPositionLeft(-320);
		}
	};
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredListRoleBySearch = useMemo(() => {
		return activeRolesWithoutUserRoles?.filter((role) => {
			return role.title?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [activeRolesWithoutUserRoles, searchTerm]);
	const addRole = async (roleId: string) => {
		setShowPopupAddRole(false);
		const activeRole = RolesClan.find((role) => role.id === roleId);
		const userIDArray = userById?.user?.id?.split(',');
		await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', userIDArray || [], [], [], []);
	};

	const deleteRole = async (roleId: string) => {
		const activeRole = RolesClan.find((role) => role.id === roleId);
		const userIDArray = userById?.user?.id?.split(',');
		await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', [], [], userIDArray || [], []);
	};
	return (
		<div className="flex flex-col">
			<div className="font-bold tracking-wider text-sm">ROLES</div>
			<div className="mt-2">
				{userRolesClan.map((role, index) => (
					<span key={role.id} className="inline-block text-xs border border-bgDisable rounded-[10px] px-2 py-1 bg-bgDisable mr-2 mb-2">
						<button
							className="mr-2 px-1 border border-bgDisable rounded-full bg-bgDisable hover:bg-gray-400"
							onClick={() => deleteRole(role.id)}
						>
							x
						</button>
						<span>{role.title}</span>
					</span>
				))}
				<UserRestrictionZone policy={isClanCreator || hasManageChannelPermission}>
					<span className="font-bold border border-bgDisable rounded-full bg-bgDisable px-2 relative" onClick={handModalAddRole}>
						+
						<div className="absolute" style={{ top: `${positionTop}px`, left: `${positionLeft}px` }}>
							{showPopupAddRole ? (
								<div className="w-[300px] h-fit bg-[#323232] p-2 text-white overflow-y: auto">
									<input
										type="text"
										className="w-full border-[#1d1c1c] rounded-[5px] bg-[#1d1c1c] px-2"
										placeholder="Role"
										onChange={handleInputChange}
									/>
									<div className="max-h-[100px] overflow-y-scroll overflow-x-hidden">
										{filteredListRoleBySearch.map((role, index) => (
											<div
												key={index}
												className=" text-xs w-full border border-bgDisable rounded-[10px] px-2 py-1 bg-bgDisable mr-2 hover:bg-[#1d1c1c] "
												onClick={() => addRole(role.id)}
											>
												{role.title}
											</div>
										))}
									</div>
								</div>
							) : null}
						</div>
					</span>
				</UserRestrictionZone>
			</div>
		</div>
	);
};

export default RoleUserProfile;
