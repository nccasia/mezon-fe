import { Icons } from '@mezon/components';
import { Button } from 'flowbite-react';

const MemberTopBar = () => {
	return (
		<div className="flex flex-row justify-between items-center py-2 px-4 border-b-[1px] dark:border-borderDivider border-buttonLightTertiary">
			<h2 className="text-base font-semibold">Recent Members</h2>
			<div className="flex flex-row items-center gap-2">
				<div className="relative">
					<div
						className={`transition-all duration-300 w-[250px] h-8 pl-4 pr-2 py-3 dark:bg-bgTertiary bg-bgModifierHoverLight rounded items-center inline-flex`}
					>
						<input
							type="text"
							placeholder="Search by user name or id"
							className="dark:text-contentTertiary text-textLightTheme placeholder-contentTertiary outline-none bg-transparent w-full"
						/>
					</div>
					<div className="w-5 h-6 flex flex-row items-center pl-1 absolute right-1 bg-transparent top-1/2 transform -translate-y-1/2">
						<Icons.Search />
					</div>
				</div>
				<div>
					<Button className="h-8 rounded focus:ring-transparent bg-bgModifierHoverLight dark:bg-buttonSecondary hover:!bg-buttonSecondaryHover items-center dark:text-textDarkTheme text-textLightTheme">
						<Icons.ConvertAccount className="rotate-90 mr-1 dark:text-textDarkTheme text-textLightTheme" />
						<span>Sort</span>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default MemberTopBar;
