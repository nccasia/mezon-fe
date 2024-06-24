import {
	HashSignLockIcon,
	STORAGE_KEY_CLAN_CURRENT_CACHE,
	SpeakerIcon,
	SpeakerLocked,
	getUpdateOrAddClanChannelCache,
	save,
} from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import {
	channelsActions,
	getStoreAsync,
	messagesActions,
	selectIsUnreadChannelById,
	selectLastChannelTimestamp,
	selectNotificationMentionCountByChannelId,
	selectVoiceChannelMembersByChannelId,
} from '@mezon/store-mobile';
import { ChannelStatusEnum, IChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import HashSignWhiteIcon from '../../../../assets/svg/channelText-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText.svg';
import { linkGoogleMeet } from '../../../utils/helpers';
import { ChannelListContext } from './Reusables';
import ThreadListChannel from './ThreadListChannel';
import UserListVoiceChannel from './UserListVoiceChannel';
import { styles } from './styles';

function useChannelBadgeCount(channelId: string) {
	const lastChannelTimestamp = useSelector(selectLastChannelTimestamp(channelId));
	const numberNotification = useSelector(selectNotificationMentionCountByChannelId(channelId, lastChannelTimestamp));

	return numberNotification;
}

export const ChannelListItem = React.memo(
	(props: { data: any; image?: string; isActive: boolean; currentChanel: IChannel; onLongPress: () => void }) => {
		const useChannelListContentIn = React.useContext(ChannelListContext);
		const voiceChannelMember = useSelector(selectVoiceChannelMembersByChannelId(props?.data?.channel_id));
		const isUnRead = useSelector(selectIsUnreadChannelById(props?.data?.channel_id));
		const numberNotification = useChannelBadgeCount(props.data?.channel_id);

		const handleRouteData = async (thread?: IChannel) => {
			const store = await getStoreAsync();
			if (props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE && props?.data?.status === 1 && props?.data?.meeting_code) {
				const urlVoice = `${linkGoogleMeet}${props?.data?.meeting_code}`;
				const urlSupported = await Linking.canOpenURL(urlVoice);
				if (urlSupported) Linking.openURL(urlVoice);
				return;
			}
			useChannelListContentIn.navigation.closeDrawer();
			const channelId = thread ? thread?.channel_id : props?.data?.channel_id;
			const clanId = thread ? thread?.clan_id : props?.data?.clan_id;
			const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
			save(STORAGE_KEY_CLAN_CURRENT_CACHE, dataSave);
			store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: channelId }));
			store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
		};

		return (
			<View>
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => handleRouteData()}
					onLongPress={props.onLongPress}
					style={[styles.channelListLink, props.isActive && styles.channelListItemActive]}
				>
					<View style={[styles.channelListItem]}>
						{isUnRead && <View style={styles.dotIsNew} />}

						{props?.data?.channel_private === ChannelStatusEnum.isPrivate && props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE && (
							<SpeakerLocked width={15} height={15} color={isUnRead ? Colors.white : Colors.bgGrayDark} />
						)}
						{props?.data?.channel_private === ChannelStatusEnum.isPrivate && props?.data?.type === ChannelType.CHANNEL_TYPE_TEXT && (
							<HashSignLockIcon width={20} height={20} color={isUnRead ? Colors.white : Colors.bgGrayDark} />
						)}
						{props?.data?.channel_private === undefined && props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE && (
							<SpeakerIcon width={16} height={16} color={isUnRead ? Colors.white : Colors.bgGrayDark} />
						)}
						{props?.data?.channel_private === undefined &&
							props?.data?.type === ChannelType.CHANNEL_TYPE_TEXT &&
							(isUnRead ? <HashSignWhiteIcon width={18} height={18} /> : <HashSignIcon width={18} height={18} />)}

						<Text style={[styles.channelListItemTitle, isUnRead && styles.channelListItemTitleActive]}>{props.data.channel_label}</Text>
					</View>

					{numberNotification > 0 &&
						<View style={styles.channelDotWrapper}>
							<Text style={styles.channelDot}>{numberNotification}</Text>
						</View>
					}
				</TouchableOpacity>
				{!!props?.data?.threads?.length && (
					<ThreadListChannel threads={props?.data?.threads} currentChanel={props.currentChanel} onPress={handleRouteData} />
				)}
				{!!voiceChannelMember?.length && <UserListVoiceChannel userListVoice={voiceChannelMember} />}
			</View>
		);
	},
);
