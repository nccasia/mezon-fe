import { OfflineStatus, OnlineStatus, OwnerIcon } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity } from '@mezon/utils';
import { useContext, useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import { style } from './style';
import { threadDetailContext } from '../../ThreadDetail/MenuThreadDetail';
import { ChannelType } from 'mezon-js';
interface IProps {
	user: ChannelMembersEntity;
	status?: boolean;
	numCharCollapse?: number;
	isHideIconStatus?: boolean;
	isHideUserName?: boolean;
	isOffline?: boolean;
	nickName?: string;
	creatorClanId?: string;
	creatorDMId?: string;
	isDMThread?: boolean;
}

export default function MemberProfile({
	user,
	status,
	isHideIconStatus,
	isHideUserName,
	numCharCollapse = 6,
	isOffline,
	nickName,
	creatorClanId,
	creatorDMId,
	isDMThread,
}: IProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChannel = useContext(threadDetailContext);
	const name = useMemo(() => {
		if (user) {
			return nickName || user?.user?.display_name || user?.user?.username;
		}
	}, [user]);
	return (
		<View style={{ ...styles.container, opacity: isOffline ? 0.5 : 1 }}>
			{/* Avatar */}
			<View style={{ padding: 0 }}>
				<View style={styles.avatarContainer}>
					<Image style={styles.avatar} source={{ uri: user?.user?.avatar_url }} />

					{!isHideIconStatus && <View style={styles.statusWrapper}>{status ? <OnlineStatus /> : <OfflineStatus />}</View>}
				</View>
			</View>

			{/* Name */}
			<View style={{ ...styles.nameContainer, borderBottomWidth: 1 }}>
				{!isHideUserName && (
					<Text style={styles.textName}>
						{user?.user?.username?.length > numCharCollapse ? `${name.substring(0, numCharCollapse)}...` : name}
					</Text>
				)}
			</View>
			{![ChannelType.CHANNEL_TYPE_DM].includes(currentChannel?.type) && (isDMThread ? creatorDMId : creatorClanId) === user?.user?.id && <OwnerIcon width={16} height={16} />}
		</View>
	);
}
