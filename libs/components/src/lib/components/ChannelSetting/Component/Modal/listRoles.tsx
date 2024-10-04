import { RolesClanEntity } from '@mezon/store';
import { Icons } from '@mezon/ui';

type ListRoleProps = {
	listItem: RolesClanEntity[];
	selectedRoleIds: string[];
	handleCheckboxRoleChange: (event: React.ChangeEvent<HTMLInputElement>, roleId: string) => void;
};

const ListRole = (props: ListRoleProps) => {
	const { listItem, selectedRoleIds, handleCheckboxRoleChange } = props;
	return listItem.map((role, index) => (
		<div className={'flex justify-between py-2 dark:hover:bg-[#43444B] hover:bg-[#E1E2E4] px-[6px] rounded'} key={role.id}>
			<label className="flex gap-x-2 items-center w-full">
				<div className="relative flex flex-row justify-center">
					<input
						id={`checkbox-item-${index}`}
						type="checkbox"
						value={role.title}
						checked={selectedRoleIds.includes(role.id)}
						onChange={(event) => handleCheckboxRoleChange(event, role?.id || '')}
						className="peer appearance-none forced-colors:appearance-auto relative w-4 h-4 border dark:border-textPrimary border-gray-600 rounded-md focus:outline-none"
					/>
					<Icons.Check className="absolute invisible peer-checked:visible forced-colors:hidden w-4 h-4" />
				</div>
				<Icons.RoleIcon defaultSize="w-5 h-5 min-w-5" />
				<p className="text-sm one-line">{role.title}</p>
			</label>
		</div>
	));
};

export default ListRole;
