import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useAccount, useAuth } from '@mezon/core';
import { HashSignIcon } from '@mezon/mobile-components';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import BannerAvatar, { IFile } from './components/Banner';
import DetailInfo from './components/Info';
import styles from './styles';
import { useCallback } from 'react';
import { EProfileTab, IUserProfileValue } from '..';
import { useNavigation } from '@react-navigation/native';

interface IUserProfile {
	triggerToSave: EProfileTab;
	userProfileValue: IUserProfileValue;
	setCurrentUserProfileValue: (updateFn: (prevValue: IUserProfileValue) => IUserProfileValue) => void;
}

export default function UserProfile({ triggerToSave, userProfileValue, setCurrentUserProfileValue }: IUserProfile) {
	const auth = useAuth();
	const { updateUser } = useAccount();
	const { sessionRef, clientRef } = useMezon();
	const currentChannel = useSelector(selectCurrentChannel);
	const [file, setFile] = useState<IFile>(null);
	const navigation = useNavigation();

	const handleAvatarChange = (data: IFile) => {
		setCurrentUserProfileValue((prevValue) => ({...prevValue, imgUrl: data?.uri}))
		setFile(data);
	}

	const handleDetailChange = (newValue: Partial<IUserProfileValue>) => {
		setCurrentUserProfileValue((prevValue) => ({...prevValue, ...newValue}))
	}

	function handleHashtagPress() {
		Toast.show({
			type: 'info',
			text1: 'Original known as ' + auth.userProfile.user.username + '#' + auth.userId,
		});
	}

	const getImageUrlToSave = useCallback(async () => {
		if (!file) {
			return userProfileValue?.imgUrl;
		}
		const session = sessionRef.current;
		const client = clientRef.current;

		if (!file || !client || !session) {
			throw new Error('Client is not initialized');
		}
		const ms = new Date().getTime();
		const fullFilename = `${currentChannel?.clan_id}/${currentChannel?.channel_id}/${ms}`.replace(/-/g, '_') + '/' + file.name;
		const res = await handleUploadFileMobile(client, session, fullFilename, file);

		return res.url;
	}, [clientRef, sessionRef, currentChannel, file, userProfileValue])

	const updateUserProfile = async () => {
		const imgUrl = await getImageUrlToSave();
		const { username, displayName, aboutMe } = userProfileValue;

		const response = await updateUser(username, imgUrl, displayName || username, aboutMe);
		if (response) {
			Toast.show({
				type: 'info',
				text1: 'Update profile success',
			});
			setFile(null);
			navigation.goBack();
		}
	}

	useEffect(() => {
		if (triggerToSave === EProfileTab.UserProfile) {
			updateUserProfile();
		}
	}, [triggerToSave]);

	return (
		<View style={styles.container}>
			<BannerAvatar avatar={userProfileValue?.imgUrl} onChange={handleAvatarChange} />

			<View style={styles.btnGroup}>
				<TouchableOpacity onPress={() => handleHashtagPress()} style={styles.btnIcon}>
					<HashSignIcon width={16} height={16} />
				</TouchableOpacity>
			</View>

			<DetailInfo
				value={{
					displayName: userProfileValue.displayName,
					username: userProfileValue.username,
					aboutMe: userProfileValue.aboutMe,
					imgUrl: userProfileValue.imgUrl
				}}
				onChange={handleDetailChange}
			/>
		</View>
	);
}
