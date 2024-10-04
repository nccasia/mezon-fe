import { Icons } from '@mezon/ui';

const TableMemberHeader = () => {
	return (
		<div className="flex flex-row justify-between items-center px-4 h-[48px] shadow border-b-[1px] dark:border-bgTertiary">
			<div className="flex-3 p-1">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">Name</span>
			</div>
			<div className="flex-1 p-1 text-center">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">Member since</span>
			</div>
			<div className="flex-1 p-1 text-center">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">Joined Mezon</span>
			</div>
			<div className="flex-1 flex flex-row gap-1 p-1 justify-center cursor-pointer">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase select-none">Roles</span>
				<Icons.FiltersIcon className="rotate-90" />
			</div>
			<div className="flex-3 flex flex-row gap-1 p-1 justify-center cursor-pointer">
				<span className="text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase select-none">Signals</span>
				<Icons.FiltersIcon className="rotate-90" />
			</div>
		</div>
	);
};

export default TableMemberHeader;
