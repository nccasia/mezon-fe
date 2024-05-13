import { channelsActions, getStoreAsync, messagesActions, selectIsUnreadChannelById } from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import HashSignWhiteIcon from '../../../../assets/svg/channelText-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText.svg';
import SpeakerIcon from '../../../../assets/svg/speaker.svg';
import { ChannelListContext, FastImageRes } from './Reusables';
import ThreadListChannel from './ThreadListChannel';
import { styles } from './styles';
export const ChannelListItem = React.memo((props: { data: any; image?: string; isActive: boolean; currentChanel: IChannel }) => {
	const useChannelListContentIn = React.useContext(ChannelListContext);
	const isUnRead = useSelector(selectIsUnreadChannelById(props?.data?.id));

	const handleRouteData = async (thread?: IChannel) => {
		const store = await getStoreAsync();
		useChannelListContentIn.navigation.closeDrawer();
		const channelId = thread ? thread?.channel_id : props?.data?.channel_id;
		const clanId = thread ? thread?.clan_id : props?.data?.clan_id;
		store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: channelId }));
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	};

	return (
		<View>
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => handleRouteData()}
				style={[styles.channelListItem, props.isActive && styles.channelListItemActive]}
			>
				{isUnRead && <View style={styles.dotIsNew} />}
				{props.image != undefined ? (
					<View style={{ width: 30, height: 30, borderRadius: 50, overflow: 'hidden' }}>
						<FastImageRes uri={props.image} />
					</View>
				) : props.data.type == ChannelType.CHANNEL_TYPE_VOICE ? (
					<SpeakerIcon width={20} height={20} fill={'#FFFFFF'} />
				) : isUnRead ? (
					<HashSignWhiteIcon width={18} height={18} />
				) : (
					<HashSignIcon width={18} height={18} />
				)}
				<Text style={[styles.channelListItemTitle, isUnRead && styles.channelListItemTitleActive]}>{props.data.channel_label}</Text>
			</TouchableOpacity>
			{!!props?.data?.threads?.length && (
				<ThreadListChannel threads={props?.data?.threads} currentChanel={props.currentChanel} onPress={handleRouteData} />
			)}
		</View>
	);
});
