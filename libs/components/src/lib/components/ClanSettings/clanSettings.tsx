import { ExitSetting } from '@mezon/components';
import { useEffect, useState } from 'react';
import ServerSettingItems from './SettingItems';
import ServerSettingMainRoles from './SettingMainRoles';
import ServerSettingRoleManagement from './SettingRoleManagement';

export type ModalSettingProps = {
	open: boolean;
	onClose: () => void;
};

const ClanSetting = (props: ModalSettingProps) => {
	const { open, onClose } = props;
	const [currentSetting, setCurrentSetting] = useState<string>('Roles');
	const handleSettingItemClick = (settingName: string) => {
		setCurrentSetting(settingName);
	};
	const [openEdit, setOpenEdit] = useState<boolean>(false);
	const closeSettingEdit = () => {
		setOpenEdit(false);
	};

	useEffect(() => {
		if (!open) {
			setOpenEdit(false);
		}
	}, [open]);

	const openSettingEdit = () => {
		setOpenEdit(true);
	};

	return (
		<div>
			{open ? (
				<div className="  flex fixed inset-0  w-screen z-10">
					<div className="flex text-gray- w-screen">
						<ServerSettingItems onItemClick={handleSettingItemClick} />

						{!openEdit ? (
							<div className="overflow-y-auto flex flex-col flex-1 shrink bg-bgSecondary w-1/2 pt-[94px] pr-[40px] pb-[94px] pl-[40px] overflow-x-hidden min-w-[700px] 2xl:min-w-[900px]">
								{currentSetting === 'Roles' && <ServerSettingMainRoles handleOpen={openSettingEdit} />}
								{/* {currentSetting === 'Account' && <SettingAccount />} */}
							</div>
						) : null}
						<ServerSettingRoleManagement flagOption={openEdit} handleClose={closeSettingEdit} />
						<ExitSetting onClose={onClose} />
					</div>
				</div>
			) : null}
		</div>
	);
};

export default ClanSetting;
