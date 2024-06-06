import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useAccount, useAuth } from '@mezon/core';
import { HashSignIcon } from '@mezon/mobile-components';
import { selectCurrentChannel } from '@mezon/store';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import BannerAvatar, { IFile } from './components/Banner';
import DetailInfo from './components/Info';
import styles from './styles';

interface IUserProfile {
	trigger: number;
}

export default function UserProfile({ trigger }: IUserProfile) {
	const auth = useAuth();
	const { updateUser } = useAccount();
	const { sessionRef, clientRef } = useMezon();
	const currentChannel = useSelector(selectCurrentChannel);

	const [avatar, setAvatar] = useState<string>(auth.userProfile.user.avatar_url);
	const [displayName, setDisplayName] = useState<string>(auth.userProfile.user.display_name);
	const [username, setUsername] = useState<string>(auth.userProfile.user.username);
	const [bio, setBio] = useState<string>(auth.userProfile.user.about_me);
	const [file, setFile] = useState<IFile>(null);

	function handleAvatarChange(data: IFile) {
		setAvatar(data.uri);
		setFile(data);
	}

	function handleDetailChange({ displayName, username, bio }: { displayName: string; username: string; bio: string }) {
		setDisplayName(displayName);
		setUsername(username);
		setBio(bio);
	}

	function handleHashtagPress() {
		Toast.show({
			type: 'info',
			text1: 'Original known as ' + auth.userProfile.user.username + '#' + auth.userId,
		});
	}

	async function handleImageFile() {
		const session = sessionRef.current;
		const client = clientRef.current;

		if (!file || !client || !session) {
			throw new Error('Client is not initialized');
		}
		const ms = new Date().getTime();
		const fullFilename = `${currentChannel?.clan_id}/${currentChannel?.channel_id}/${ms}`.replace(/-/g, '_') + '/' + file.name;
		const res = await handleUploadFileMobile(client, session, fullFilename, file);

		return res.url;
	}

	async function updateUserProfile() {
		const imgUrl = await handleImageFile();
		setAvatar(imgUrl);
		updateUser(username, imgUrl, displayName, bio);
		Toast.show({
			type: 'info',
			text1: 'Update profile success',
		});
	}

	useEffect(() => {
		if (trigger) {
			updateUserProfile();
		}
	}, [trigger]);

	return (
		<View style={styles.container}>
			<BannerAvatar avatar={avatar} onChange={handleAvatarChange} />

			<View style={styles.btnGroup}>
				<View style={styles.btnIcon}>
					<TouchableOpacity onPress={handleHashtagPress}>
						<HashSignIcon width={16} height={16} />
					</TouchableOpacity>
				</View>
			</View>

			<DetailInfo value={{ displayName, username, bio }} onChange={handleDetailChange} />
		</View>
	);
}
