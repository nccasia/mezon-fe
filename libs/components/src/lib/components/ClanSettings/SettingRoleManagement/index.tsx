import { useRoles } from '@mezon/core';
import {
	RolesClanEntity,
	getIsShow,
	getNewAddMembers,
	getNewAddPermissions,
	getNewNameRole,
	getRemovePermissions,
	getSelectedRoleId,
	selectCurrentClan,
	setNameRoleNew,
	setSelectedPermissions,
} from '@mezon/store';
import { useDispatch, useSelector } from 'react-redux';
import SettingUserClanProfileSave from '../../SettingProfile/SettingRightClanProfile/settingUserClanProfileSave';
import SettingListRole from './SettingListRole';
import SettingValueDisplayRole from './SettingOptionRole';
type EditNewRole = {
	flagOption: boolean;
	RolesClan: RolesClanEntity[];
	handleClose: () => void;
};
export type ModalSettingSave = {
	flagOption: boolean;
	handleClose: () => void;
	handleSaveClose: () => void;
	handleUpdateUser: () => Promise<void>;
};
const ServerSettingRoleManagement = (props: EditNewRole) => {
	const {RolesClan} = props;
	const { createRole, updateRole } = useRoles();
	const clickRole = useSelector(getSelectedRoleId);
	const nameRole = useSelector(getNewNameRole);
	const addPermissions = useSelector(getNewAddPermissions);
	const removePermissions = useSelector(getRemovePermissions);
	const addUsers = useSelector(getNewAddMembers);
	const dispatch = useDispatch();
	const currentClan = useSelector(selectCurrentClan);
	const isChange = useSelector(getIsShow);

	const handleClose = () => {
		if (clickRole === 'New Role') {
			props.handleClose();
		} else {
			const activeRole = RolesClan.find((role) => role.id === clickRole);
			const permissions = activeRole?.permission_list?.permissions;
			const permissionIds = permissions ? permissions.filter((permission) => permission.active === 1).map((permission) => permission.id) : [];

			dispatch(setNameRoleNew(activeRole?.title));
			dispatch(setSelectedPermissions(permissionIds));
		}
	};
	const handleSaveClose = () => {};

	const handleUpdateUser = async () => {
		if (clickRole === 'New Role') {
			props.handleClose();
			await createRole(currentClan?.id || '', currentClan?.id || '', nameRole, addUsers, addPermissions);
		} else {
			await updateRole(currentClan?.id ?? '', clickRole, nameRole, [], addPermissions, [], removePermissions);
		}
	};

	const saveProfile: ModalSettingSave = {
		flagOption: isChange,
		handleClose,
		handleSaveClose,
		handleUpdateUser,
	};
	return props.flagOption ? (
		<div className="absolute top-0 left-0 w-full h-full pl-2 overflow-y-auto flex flex-row flex-1 shrink bg-white dark:bg-bgPrimary overflow-x-hidden">
			<SettingListRole handleClose={props.handleClose} RolesClan={RolesClan}/>
			<div className="border-l border-gray-400"></div>
			<div className=" w-2/3">
				<div className="font-semibold pl-3 dark:text-white text-black">
					{clickRole === 'New Role' ? (
						<div className="tracking-wide text-sm mb-4">NEW ROLE</div>
					) : (
						<div className="tracking-wide mb-4 text-sm">EDIT ROLE</div>
					)}
					<SettingValueDisplayRole RolesClan={RolesClan}/>
				</div>
			</div>
			<SettingUserClanProfileSave PropsSave={saveProfile} />
		</div>
	) : null;
};

export default ServerSettingRoleManagement;
