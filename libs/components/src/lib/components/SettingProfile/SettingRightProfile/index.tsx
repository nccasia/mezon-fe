import { useAuth } from '@mezon/core';
import { useEffect, useState } from 'react';
import SettingRightClan from '../SettingRightClanProfile';
import SettingRightUser from '../SettingRightUserProfile';
const SettingRightProfile = () => {
	const { userProfile } = useAuth();
	const [isUserSettings, setIsUserSettings] = useState(true);

	const handleClanProfileClick = () => {
		setIsUserSettings(false);
	};

	const handleUserSettingsClick = () => {
		setIsUserSettings(true);
	};

	return (
		<>
			{isUserSettings ? (
				<SettingRightUser
					onClanProfileClick={handleClanProfileClick}
					name={userProfile?.user?.username || ''}
					avatar={userProfile?.user?.avatar_url || ''}
					nameDisplay={userProfile?.user?.display_name || ''}
					aboutMe = {userProfile?.user?.about_me || ''}
				/>
			) : (
				<SettingRightClan onUserProfileClick={handleUserSettingsClick} />
			)}
		</>
	);
};

export default SettingRightProfile;
