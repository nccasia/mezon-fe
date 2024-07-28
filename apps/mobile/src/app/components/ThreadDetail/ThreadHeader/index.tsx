import { useMemberStatus } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { ChannelStatusEnum } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import { memo, useContext, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MezonAvatar } from '../../../temp-ui';
import { threadDetailContext } from '../MenuThreadDetail';
import { style } from './styles';

export const ThreadHeader = memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChannel = useContext(threadDetailContext);
	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);
	const userStatus = useMemberStatus(currentChannel?.user_id?.length === 1 ? currentChannel?.user_id[0] : '');
	const navigation = useNavigation<any>();
	return (
		<View style={styles.channelLabelWrapper}>
			<TouchableOpacity style={styles.iconBackHeader} onPress={() => navigation.goBack()}>
				<Icons.ArrowLargeLeftIcon color={themeValue.text} height={20} width={20} />
			</TouchableOpacity>

			{isDMThread ? (
				<View style={styles.avatarWrapper}>
					<View>
						{currentChannel?.channel_avatar?.length > 1 ? (
							<View style={[styles.groupAvatar, styles.avatarSize]}>
								<Icons.GroupIcon color={baseColor.white} />
							</View>
						) : (
							<MezonAvatar
								avatarUrl={currentChannel.channel_avatar?.[0]}
								username={currentChannel?.channel_label}
								userStatus={userStatus}
							/>
						)}
					</View>
					<Text numberOfLines={5} style={styles.dmLabel}>
						{currentChannel?.channel_label}
					</Text>
				</View>
			) : (
				<View style={styles.channelText}>
					{currentChannel?.channel_private === ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT ? (
						<Icons.TextLockIcon width={20} height={20} color={themeValue.text} />
					) : (
						<Icons.TextIcon width={20} height={20} color={themeValue.text} />
					)}
					<Text numberOfLines={1} style={styles.channelLabel}>
						{currentChannel?.channel_label}
					</Text>
				</View>
			)}
		</View>
	);
});
