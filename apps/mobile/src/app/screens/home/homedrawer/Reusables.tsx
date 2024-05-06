import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { selectIsUnreadChannelById } from '@mezon/store';
import { ICategoryChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import HashSignWhiteIcon from '../../../../assets/svg/channelText-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText.svg';
import AngleDownIcon from '../../../../assets/svg/guildDropdownMenu.svg';
import SpeakerIcon from '../../../../assets/svg/speaker.svg';
import ThreadListChannel from './ThreadListChannel';
import { styles } from './styles';

export const ChannelListContext = React.createContext({} as any);
export const ClanIcon = React.memo((props: { icon?: any; data: any; onPress?: any; isActive?: boolean }) => {
	return (
		<TouchableOpacity
			activeOpacity={props?.onPress ? 0.7 : 1}
			key={Math.floor(Math.random() * 9999999).toString() + props?.data?.clan_id}
			style={[styles.wrapperClanIcon]}
			onPress={() => {
				if (props?.onPress && props?.data?.clan_id) {
					props?.onPress(props?.data?.clan_id);
				}
			}}
		>
			<View style={[styles.clanIcon, props?.isActive && styles.clanIconActive]}>
				{props.icon ? (
					props.icon
				) : props?.data?.logo ? (
					<FastImageRes uri={props.data.logo} />
				) : (
					<Text style={styles.textLogoClanIcon}>{props?.data?.clan_name.charAt(0).toUpperCase()}</Text>
				)}
			</View>
			{props?.isActive && <View style={styles.lineActiveClan} />}
		</TouchableOpacity>
	);
});

export const FastImageRes = React.memo(({ uri }: { uri: string }) => {
	return (
		<FastImage
			style={{ width: '100%', height: '100%' }}
			source={{
				uri: uri,
				headers: { Authorization: 'someAuthToken' },
				priority: FastImage.priority.normal,
			}}
			resizeMode={FastImage.resizeMode.cover}
		/>
	);
});

export const ChannelListHeader = React.memo((props: { title: string; onPress: any; isCollapsed: boolean }) => {
	return (
		<TouchableOpacity onPress={props?.onPress} key={Math.floor(Math.random() * 9999999).toString()} style={styles.channelListHeader}>
			<View style={styles.channelListHeaderItem}>
				<AngleDownIcon width={20} height={20} style={[props?.isCollapsed && { transform: [{ rotate: '-90deg' }] }]} />
				<Text style={styles.channelListHeaderItemTitle}>{props.title}</Text>
			</View>
		</TouchableOpacity>
	);
});

export const ChannelListSection = React.memo((props: { data: ICategoryChannel; index: number; onPressHeader: any; collapseItems: any }) => {
	const isCollapsed = props?.collapseItems?.includes?.(props?.index?.toString?.());
	const isUnReadChannel = useSelector(selectIsUnreadChannelById(props?.data?.id));

	return (
		<View key={Math.floor(Math.random() * 9999999).toString()} style={styles.channelListSection}>
			<ChannelListHeader
				title={props.data.category_name}
				onPress={() => props?.onPressHeader?.(props?.index?.toString?.())}
				isCollapsed={isCollapsed}
			/>
			{!isCollapsed &&
				props.data.channels?.map((item: any, index: number) => (
					<ChannelListItem data={item} key={Math.floor(Math.random() * 9999999).toString() + index} isUnRead={isUnReadChannel} />
				))}
		</View>
	);
});

export const ChannelListItem = React.memo((props: { data: any; image?: string; isUnRead: boolean }) => {
	const useChannelListContentIn = React.useContext(ChannelListContext);

	const handleRouteData = React.useCallback(() => {
		useChannelListContentIn.navigation.closeDrawer();
	}, []);

	return (
		<View>
			<View onTouchEnd={handleRouteData} style={styles.channelListItem}>
				{props.isUnRead && <View style={styles.dotIsNew} />}
				{props.image != undefined ? (
					<View style={{ width: 30, height: 30, borderRadius: 50, overflow: 'hidden' }}>
						<FastImageRes uri={props.image} />
					</View>
				) : props.data.type == ChannelType.CHANNEL_TYPE_VOICE ? (
					<SpeakerIcon width={20} height={20} fill={'#FFFFFF'} />
				) : props.isUnRead ? (
					<HashSignWhiteIcon width={18} height={18} />
				) : (
					<HashSignIcon width={18} height={18} />
				)}
				<Text style={[styles.channelListItemTitle, props.isUnRead && styles.channelListItemTitleActive]}>{props.data.channel_label}</Text>
			</View>
			{!!props?.data?.threads?.length && <ThreadListChannel threads={props?.data?.threads} />}
		</View>
	);
});
