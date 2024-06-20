import {
	HashSignLockIcon,
	STORAGE_KEY_CLAN_CURRENT_CACHE,
	SpeakerIcon,
	SpeakerLocked,
	getUpdateOrAddClanChannelCache,
	save,
} from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { channelsActions, getStoreAsync, messagesActions, selectIsUnreadChannelById } from '@mezon/store-mobile';
import { ChannelStatusEnum, IChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import HashSignWhiteIcon from '../../../../assets/svg/channelText-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText.svg';
import { ChannelListContext } from './Reusables';
import ThreadListChannel from './ThreadListChannel';
import { styles } from './styles';
export const ChannelListItem = React.memo((props: { data: any; image?: string; isActive: boolean; currentChanel: IChannel, onLongPress: () => void }) => {
	const useChannelListContentIn = React.useContext(ChannelListContext);
	const isUnRead = useSelector(selectIsUnreadChannelById(props?.data?.id));

	const handleRouteData = async (thread?: IChannel) => {

		const store = await getStoreAsync();
		if (props.data.type === ChannelType.CHANNEL_TYPE_VOICE) {
			// 	TODO: handle voice channel
			alert('updating...');
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
				style={[styles.channelListItem, props.isActive && styles.channelListItemActive]}
			>
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
			</TouchableOpacity>
			{!!props?.data?.threads?.length && (
				<ThreadListChannel threads={props?.data?.threads} currentChanel={props.currentChanel} onPress={handleRouteData} />
			)}
		</View>
	);
});
