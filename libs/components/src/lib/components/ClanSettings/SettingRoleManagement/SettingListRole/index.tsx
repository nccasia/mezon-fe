import {
	RolesClanEntity,
	getIsShow,
	getNewNameRole,
	getSelectedRoleId,
	selectTheme,
	setAddMemberRoles,
	setNameRoleNew,
	setSelectedPermissions,
	setSelectedRoleId,
} from '@mezon/store';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../../../../../../../ui/src/lib/Icons';
type closeEditRole = {
	RolesClan: RolesClanEntity[];
	handleClose: () => void;
	handleUpdateUser: () => Promise<void>;
};
const SettingListRole = (props: closeEditRole) => {
	const { RolesClan, handleClose, handleUpdateUser } = props;
	const dispatch = useDispatch();
	const appearanceTheme = useSelector(selectTheme);
	const isChange = useSelector(getIsShow);

	const clickRole = useSelector(getSelectedRoleId);
	const [clickedRole, setClickedRole] = useState<null | string>(clickRole);
	const nameRoleNew = useSelector(getNewNameRole);

	const isNewRole = clickedRole === 'New Role';
	const handleRoleClick = (roleId: string) => {
		handleUpdateUser();
		if (!isChange || isNewRole) {
			const activeRole = RolesClan.find((role) => role.id === roleId);
			const memberIDRoles = activeRole?.role_user_list?.role_users?.map((member) => member.id) || [];

			const permissionsRole = activeRole?.permission_list;
			const permissions = permissionsRole?.permissions?.filter((permission) => permission.active === 1) || [];
			const permissionIds = permissions.map((permission) => permission.id) || [];

			dispatch(setNameRoleNew(activeRole?.title));
			dispatch(setAddMemberRoles(memberIDRoles));
			dispatch(setSelectedPermissions(permissionIds));
			setClickedRole(roleId);
			dispatch(setSelectedRoleId(roleId));
		}
	};
	const activeRoles = RolesClan.filter((role) => role.active === 1);

	const containerRef = useRef<HTMLDivElement>(null);
    const newRoleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isNewRole && newRoleRef.current) {
            newRoleRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
    }, [clickedRole, isNewRole]);
	
	return (
		<div className="w-1/3 pr-3 flex flex-col mb-20">
			<div className="font-semibold mb-4 flex cursor-pointer" onClick={() => handleClose()}>
				<div className="rotate-90 -ml-[10px] dark:text-textDarkTheme text-textLightTheme">
					<Icons.ArrowDown />
				</div>
				<div className="tracking-wide text-base dark:text-textSecondary text-textSecondary800" role="button">
					BACK
				</div>
			</div>
			<div 
				ref={containerRef}
				className={`overflow-y-scroll flex flex-col gap-y-2 hide-scrollbar  ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
			>
				{activeRoles.map((role) => (
					<div key={role.id}>
						<ItemRole title={role.title || ''} onHandle={() => handleRoleClick(role.id)} isChoose={clickedRole === role.id}/>
					</div>
				))}
				{isNewRole && <ItemRole ref={newRoleRef} title={nameRoleNew ?? 'New Role'} isChoose/>}
			</div>
		</div>
	);
};

export default SettingListRole;

type ItemRoleProps = {
	title: string;
	isChoose?: boolean;
	onHandle?: () => void;
}

const ItemRole = forwardRef<HTMLDivElement, ItemRoleProps>((props, ref) => {
	const {title, isChoose, onHandle=()=>{}} = props;
	return (
		<div ref={ref} onClick={onHandle}>
			<button 
				className={`w-full py-1.5 px-[10px] text-[15px] bg-transparent dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton font-medium inline-flex gap-x-2 items-center rounded dark:text-textDarkTheme text-textLightTheme
					${isChoose ? 'dark:bg-[#4e5058] bg-bgModifierHoverLight' : ''}
				`}
			>
				<div className="size-3 bg-contentTertiary rounded-full min-w-3"></div>
				<span className="one-line">{title}</span>
			</button>
		</div>
	)
})