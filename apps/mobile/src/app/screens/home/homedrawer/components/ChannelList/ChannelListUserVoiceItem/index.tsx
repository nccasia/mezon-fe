import { useMembersVoiceChannel } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { selectMemberByGoogleId } from '@mezon/store-mobile';
import { IChannelMember } from '@mezon/utils';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../../../../../temp-ui/MezonAvatar';
import { style } from './styles';

interface IUserVoiceProps {
	userVoice: IChannelMember;
	channelID: string;
}
const UserVoiceItem = React.memo(({ userVoice, channelID }: IUserVoiceProps) => {
	const styles = style(useTheme().themeValue);
	const member = useSelector(selectMemberByGoogleId(userVoice.id ?? ''));
	const { setMembersVoiceChannel } = useMembersVoiceChannel();

	useEffect(() => {
		setMembersVoiceChannel(channelID, userVoice.id);
	}, [setMembersVoiceChannel, channelID, userVoice.id]);
	return (
		<View style={styles.userVoiceWrapper}>
			<MezonAvatar
				width={18} height={18}
				username={member?.user?.username || userVoice?.participant}
				avatarUrl={member?.user?.avatar_url}
			/>
			{member ? (
				<Text style={styles.userVoiceName}>{member?.user?.username}</Text>
			) : (
				<Text style={styles.userVoiceName}>{userVoice?.participant} (guest)</Text>
			)}
		</View>
	);
});

export default UserVoiceItem;
