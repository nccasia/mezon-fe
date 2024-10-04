type ProfileTabsProps = {
	activeTab: string;
	onActiveTabChange: (tabId: string) => void;
};

export const typeTab = {
	ABOUT_ME: 'About Me',
	ACTIVITY: 'Activity',
	MUTUAL_FRIENDS: 'Mutual Friends',
	MUTUAL_SERVERS: 'Mutual Servers'
};

const profileTabs = [
	{ id: typeTab.ABOUT_ME, name: typeTab.ABOUT_ME },
	{ id: typeTab.ACTIVITY, name: typeTab.ACTIVITY },
	{ id: typeTab.MUTUAL_FRIENDS, name: typeTab.MUTUAL_FRIENDS },
	{ id: typeTab.MUTUAL_SERVERS, name: typeTab.MUTUAL_SERVERS }
];

const ProfileTabs = ({ activeTab, onActiveTabChange }: ProfileTabsProps) => {
	const handleClickTab = (tabId: string) => {
		onActiveTabChange(tabId);
	};

	return (
		<div className="mt-4 mx-4">
			<ul className="flex gap-8 h-[25px] dark:border-borderDivider border-borderLightTabs border-b-[1px]">
				{profileTabs.map((tab) => (
					<li
						key={tab.id}
						onClick={() => handleClickTab(tab.id)}
						className={`text-sm font-normal hover:border-white border-b-[1px] cursor-pointer ${activeTab === tab.id ? 'dark:border-white border-black' : 'border-transparent'}`}
					>
						{tab.name}
					</li>
				))}
			</ul>
		</div>
	);
};

export default ProfileTabs;
