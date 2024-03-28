import { useRoles } from '@mezon/core';
import * as Icons from '../../../Icons';

export type RolesComponentProps = {
	tick?: boolean;
};

const RolesComponent = ({ tick }: RolesComponentProps) => {
	const { RolesClan } = useRoles();
	const activeRoles = RolesClan.filter((role) => role.active === 1);

	return (
		<>
			<p className="uppercase font-bold text-xs pb-4">Roles</p>
			<div>
				{activeRoles.map((role, index) => (
					<div className={`flex justify-between py-2 ${tick ? 'hover:bg-[#43444B] px-[6px]' : ''} rounded`} key={role.id}>
						<div className="flex gap-x-2 items-center">
							{tick && (
								<input
									id={`checkbox-item-${index}`}
									type="checkbox"
									value={role.title}
									className="peer relative appearance-none w-5 h-5 border rounded-sm focus:outline-none checked:bg-gray-300"
								></input>
							)}
							<Icons.RoleIcon defaultSize="w-[23px] h-5" />
							<p className="text-sm">{role.title}</p>
						</div>
						<div className="flex items-center gap-x-2">
							<p className="text-xs text-[#AEAEAE]">Role</p>
							{!tick && <Icons.EscIcon defaultSize="size-[15px] cursor-pointer" />}
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default RolesComponent;
