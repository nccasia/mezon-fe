import { Icons } from '@mezon/ui';
import { Link, NavLink } from 'react-router-dom';
import { ITabs } from '../../common/constants/tabSideBar';

interface ISideBarProps {
	tabs: ITabs[];
	mode?: string;
	currentAppId?: string;
}

const AppDetailLeftMenu = ({ tabs, mode = 'root', currentAppId }: ISideBarProps) => {
	return (
		<div className="flex flex-col gap-6 items-center w-full ">
			<Link to={'/admin/applications'} className="w-full flex gap-1 items-center">
				<div className="w-4">
					<Icons.LeftArrowIcon className="w-full" />
				</div>
				<div>Back to Applications</div>
			</Link>
			<div className="w-full">
				<div className="text-[12px] font-semibold">SELECT APP</div>
			</div>
			<div className="w-full">
				<div className="text-[12px] font-semibold mb-2">SETTINGS</div>
				<div className="flex flex-col w-full gap-[10px]">
					{tabs.map((tab, index) => (
						<NavLink
							key={index}
							to={`/admin/applications/${currentAppId}/${tab.routerLink}`}
							className={({ isActive }) =>
								isActive
									? 'sidebar-tab flex gap-3 items-center py-2 px-4 dark:bg-[#3C4370] bg-bgLightModeButton text-[#5865F3] dark:text-[#C9CDFB] rounded-[4px]'
									: 'sidebar-tab flex gap-3 items-center py-2 px-4 dark:text-textDarkTheme text-textLightTheme hover:dark:bg-[#3C4370] hover:bg-bgLightModeButton hover:text-[#5865F3] rounded-md'
							}
						>
							{tab.imgSrc && <img src={tab.imgSrc} alt="img" width={20} height={20} />}
							<div>{tab.icon}</div>
							<p className="font-medium text-base leading-5">{tab.name}</p>
						</NavLink>
					))}
				</div>
			</div>
		</div>
	);
};

export default AppDetailLeftMenu;
