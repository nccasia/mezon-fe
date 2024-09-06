import { Icons, STORAGE_DATA_CLAN_CHANNEL_CACHE, getUpdateOrAddClanChannelCache, save } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { selectIsUnreadChannelById } from '@mezon/store';
import { channelsActions, getStoreAsync, selectCurrentChannelId, selectVoiceChannelMembersByChannelId } from '@mezon/store-mobile';
import { ChannelStatusEnum, ChannelThreads, IChannel } from '@mezon/utils';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { linkGoogleMeet } from '../../../../../../utils/helpers';
import { ChannelBadgeUnread } from '../ChannelBadgeUnread';
import ListChannelThread from '../ChannelListThread';
import UserListVoiceChannel from '../ChannelListUserVoice';
import { style } from './styles';

interface IChannelListItemProps {
	data: any;
	image?: string;
	onLongPress: () => void;
	onLongPressThread?: (thread: ChannelThreads) => void;
}

export enum StatusVoiceChannel {
	Active = 1,
	No_Active = 0
}

export const ChannelListItem = React.memo((props: IChannelListItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChanelId = useSelector(selectCurrentChannelId);
	const isUnRead = useSelector(selectIsUnreadChannelById(props?.data?.id));
	const voiceChannelMember = useSelector(selectVoiceChannelMembersByChannelId(props?.data?.channel_id));
	const timeoutRef = useRef<any>();
	const navigation = useNavigation();

	const isActive = useMemo(() => {
		return currentChanelId === props?.data?.id;
	}, [currentChanelId, props?.data?.id]);

	useEffect(() => {
		return () => {
			timeoutRef.current && clearTimeout(timeoutRef.current);
		};
	}, []);

	const handleRouteData = async (thread?: IChannel) => {
		if (props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			if (props?.data?.status === StatusVoiceChannel.Active && props?.data?.meeting_code) {
				const urlVoice = `${linkGoogleMeet}${props?.data?.meeting_code}`;
				await Linking.openURL(urlVoice);
				return;
			}
		} else {
			navigation.dispatch(DrawerActions.closeDrawer());
			const channelId = thread ? thread?.channel_id : props?.data?.channel_id;
			const clanId = thread ? thread?.clan_id : props?.data?.clan_id;
			const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
			const store = await getStoreAsync();
			store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
		}
	};

	return (
		<View>
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => handleRouteData()}
				onLongPress={props.onLongPress}
				style={[styles.channelListLink, isActive && styles.channelListItemActive]}
			>
				<View style={[styles.channelListItem]}>
					{isUnRead && <View style={styles.dotIsNew} />}

					{props?.data?.channel_private === ChannelStatusEnum.isPrivate && props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE && (
						<Icons.VoiceLockIcon
							width={size.s_16}
							height={size.s_16}
							color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal}
						/>
					)}
					{props?.data?.channel_private === ChannelStatusEnum.isPrivate && props?.data?.type === ChannelType.CHANNEL_TYPE_TEXT && (
						<Icons.TextLockIcon
							width={size.s_16}
							height={size.s_16}
							color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal}
						/>
					)}
					{props?.data?.channel_private !== ChannelStatusEnum.isPrivate && props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE && (
						<Icons.VoiceNormalIcon
							width={size.s_16}
							height={size.s_16}
							color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal}
						/>
					)}
					{props?.data?.channel_private !== ChannelStatusEnum.isPrivate && props?.data?.type === ChannelType.CHANNEL_TYPE_TEXT && (
						<Icons.TextIcon width={size.s_16} height={size.s_16} color={isUnRead ? themeValue.channelUnread : themeValue.channelNormal} />
					)}
					<Text style={[styles.channelListItemTitle, isUnRead && styles.channelListItemTitleActive]} numberOfLines={1}>
						{props.data.channel_label}
					</Text>
				</View>
				{props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE && props?.data?.status === StatusVoiceChannel.No_Active && (
					<ActivityIndicator color={themeValue.white} />
				)}

				<ChannelBadgeUnread channelId={props.data?.channel_id} />
			</TouchableOpacity>

			{!!props?.data?.threads?.length && (
				<ListChannelThread threads={props?.data?.threads} onPress={handleRouteData} onLongPress={props?.onLongPressThread} />
			)}
			{!!voiceChannelMember?.length && <UserListVoiceChannel userListVoice={voiceChannelMember} />}
		</View>
	);
});
