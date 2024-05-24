import { useClans } from '@mezon/core';
import { authActions, useAppDispatch } from '@mezon/store';
import { LogoutModal } from 'libs/ui/src/lib/LogOutButton';
import { useState } from 'react';
import { ItemObjProps, ItemSetting, listItemSetting } from '../ItemObj';
import SettingItem from '../SettingItem';

type SettingSidebarProps = {
	onClickItem?: (settingItem: ItemObjProps) => void;
};

const SettingSidebar = ({ onClickItem }: SettingSidebarProps) => {
	const [selectedButton, setSelectedButton] = useState<string | null>(ItemSetting.OVERVIEW);
	const { currentClan } = useClans();

	const [openModal, setOpenModal] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const handleLogOut = () => {
		dispatch(authActions.logOut());
	};
	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedButton('');
	};

	const handleClickButtonSidebar = (settingItem: ItemObjProps) => {
		onClickItem?.(settingItem);
		setSelectedButton(settingItem.id);
	};

	return (
		<div className="flex flex-row flex-1 justify-end">
			<div className="w-[220px] py-[60px] pl-5 pr-[6px]">
				<p className="text-[#84ADFF] pl-[10px] pb-[6px] font-bold text-sm tracking-wider uppercase">{currentClan?.clan_name}</p>
				{listItemSetting.map((setting) => (
					<SettingItem
						key={setting.id}
						name={setting.name}
						active={selectedButton === setting.id}
						onClick={() => handleClickButtonSidebar(setting)}
					/>
				))}
				<LogoutModal isOpen={openModal} handleLogOut={handleLogOut} onClose={handleCloseModal} />
			</div>
		</div>
	);
};

export default SettingSidebar;
