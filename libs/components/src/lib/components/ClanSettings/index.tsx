import { useState } from 'react';
import { ExitSetting } from '../SettingProfile';
import ClanSettingOverview from './ClanSettingOverview';
import { ItemObjProps, ItemSetting, listItemSetting } from './ItemObj';
import ServerSettingMainRoles from './SettingMainRoles';
import SettingSidebar from './SettingSidebar';

export type ModalSettingProps = {
	open: boolean;
	onClose: () => void;
};

const ClanSetting = (props: ModalSettingProps) => {
	const { open, onClose } = props;
	const [currentSetting, setCurrentSetting] = useState<ItemObjProps>(listItemSetting[0]);
	const handleSettingItemClick = (settingItem: ItemObjProps) => {
		setCurrentSetting(settingItem);
	};

	return (
		<div>
			{open ? (
				<div className="  flex fixed inset-0  w-screen z-10">
					<div className="flex flex-row w-screen">
						<div className="flex flex-col flex-1 dark:bg-bgSecondary bg-bgLightSecondary">
							<SettingSidebar onClickItem={handleSettingItemClick} />
						</div>

						<div className="flex-3 bg-white dark:bg-bgPrimary">
							<div className="flex flex-row flex-1 justify-start h-full">
								<div className="w-[740px] px-[40px] pt-[60px] pb-[80px]">
									<div className="relative h-full">
										<h2 className="text-xl font-semibold mb-5 dark:text-textDarkTheme text-textLightTheme">
											{currentSetting.name}
										</h2>
										{currentSetting.id === ItemSetting.OVERVIEW && <ClanSettingOverview />}
										{currentSetting.id === ItemSetting.ROLES && <ServerSettingMainRoles />}
									</div>
								</div>
								<ExitSetting onClose={onClose} />
							</div>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default ClanSetting;
