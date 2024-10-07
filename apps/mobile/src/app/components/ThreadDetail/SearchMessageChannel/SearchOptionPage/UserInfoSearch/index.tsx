import { IUserMention } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { MezonAvatar } from '../../../../../componentUI';
import { style } from '../SearchOptionPage.styles';

interface UserInfoSearchProps {
	onSelectUserInfo: (user: IUserMention) => void;
	userData: IUserMention;
}

export default function UserInfoSearch({ onSelectUserInfo, userData }: UserInfoSearchProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<TouchableOpacity onPress={() => onSelectUserInfo(userData)} style={styles.userInfoBox}>
			<MezonAvatar userStatus={true} height={size.s_40} width={size.s_40} username={userData?.display} avatarUrl={userData?.avatarUrl} />
			<Block>
				<Text style={styles.userName}>{userData?.display}</Text>
				<Text style={styles.subUserName}>{userData?.subDisplay}</Text>
			</Block>
		</TouchableOpacity>
	);
}
