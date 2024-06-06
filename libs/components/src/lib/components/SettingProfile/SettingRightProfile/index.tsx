import { useAuth } from '@mezon/core';
import { useEffect, useState } from 'react';
import SettingRightClan from '../SettingRightClanProfile';
import SettingRightUser from '../SettingRightUserProfile';

interface SettingRightProfileProps{
	menuIsOpen: boolean;
}

const SettingRightProfile = ({menuIsOpen} : SettingRightProfileProps) => {
	const { userProfile } = useAuth();
	const [isUserSettings, setIsUserSettings] = useState(true);

	const handleClanProfileClick = () => {
		setIsUserSettings(false);
	};

	const handleUserSettingsClick = () => {
		setIsUserSettings(true);
	};

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			{isUserSettings ? (
				<SettingRightUser
					onClanProfileClick={handleClanProfileClick}
					name={userProfile?.user?.username || ''}
					avatar={userProfile?.user?.avatar_url || ''}
					nameDisplay={userProfile?.user?.display_name || ''}
					aboutMe = {userProfile?.user?.about_me || ''}
					menuIsOpen={menuIsOpen}
				/>
			) : (
				<SettingRightClan menuIsOpen={menuIsOpen} onUserProfileClick={handleUserSettingsClick} />
			)}
		</>
	);
};

export default SettingRightProfile;
