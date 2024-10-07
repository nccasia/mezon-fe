import { useTheme } from '@mezon/mobile-ui';
import { selectMemberClanByGoogleId } from '@mezon/store-mobile';
import { IChannelMember, getAvatarForPrioritize, getNameForPrioritize } from '@mezon/utils';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../../../../../componentUI/MezonAvatar';
import { style } from './styles';

interface IUserVoiceProps {
	userVoice: IChannelMember;
}
const UserVoiceItem = React.memo(({ userVoice }: IUserVoiceProps) => {
	const styles = style(useTheme().themeValue);
	const member = useSelector(selectMemberClanByGoogleId(userVoice.user_id ?? ''));
	const name = useMemo(() => {
		return getNameForPrioritize(member?.clan_nick, member?.user?.display_name, member?.user?.username);
	}, [member?.clan_nick, member?.user?.display_name, member?.user?.username]);
	const avatar = useMemo(() => {
		return getAvatarForPrioritize(member?.clan_avatar, member?.user?.avatar_url);
	}, [member?.clan_avatar, member?.user?.avatar_url]);

	return (
		<View style={styles.userVoiceWrapper}>
			<MezonAvatar width={18} height={18} username={name || userVoice?.participant} avatarUrl={avatar} />
			{member ? <Text style={styles.userVoiceName}>{name}</Text> : <Text style={styles.userVoiceName}>{userVoice?.participant} (guest)</Text>}
		</View>
	);
});

export default UserVoiceItem;
