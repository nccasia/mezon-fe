import { ExitSetting, SettingAccount, SettingItem, SettingRightProfile, SettingAppearance } from '@mezon/components';
import { useState } from 'react';

export type ModalSettingProps = {
	open: boolean;
	onClose: () => void;
};

const Setting = (props: ModalSettingProps) => {
	const { open, onClose } = props;
	const [currentSetting, setCurrentSetting] = useState<string>('Profiles');
	const handleSettingItemClick = (settingName: string) => {
		setCurrentSetting(settingName);
		console.log(currentSetting);
	};

	return (
		<div>
			{open ? (
				<div className=" z-10 flex fixed inset-0  w-screen">
					<div className="flex text-gray- w-screen relative">
						<SettingItem onItemClick={handleSettingItemClick} />
						{currentSetting === 'Account' && <SettingAccount />}
						{currentSetting === 'Profiles' && <SettingRightProfile />}
						{currentSetting === 'Appearance' && <SettingAppearance />}
						<ExitSetting onClose={onClose} />
					</div>
				</div>
			) : null}
		</div>
	);
};

export default Setting;
