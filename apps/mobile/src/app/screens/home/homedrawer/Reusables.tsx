import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { selectCurrentChannel } from '@mezon/store-mobile';
import { ICategoryChannel, IUser } from '@mezon/utils';
import { useSelector } from 'react-redux';
import AngleDownIcon from '../../../../assets/svg/guildDropdownMenu.svg';
import { ChannelListItem } from './ChannelListItem';
import { styles } from './styles';
import { useChannelMembers } from '@mezon/core';
import { useEffect } from 'react';
import { MezonButton } from '../../../temp-ui';

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
					<Image source={{ uri: props.data.logo }} style={styles.logoClan} />
				) : (
					<Text style={styles.textLogoClanIcon}>{props?.data?.clan_name.charAt(0).toUpperCase()}</Text>
				)}
			</View>
			{props?.isActive && <View style={styles.lineActiveClan} />}
		</TouchableOpacity>
	);
});

export const FastImageRes = React.memo(({ uri, isCirle = false }: { uri: string, isCirle?: boolean }) => {
	return (
		<FastImage
			style={[{ width: '100%', height: '100%' }, isCirle && {borderRadius: 50}]}
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
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={props?.onPress}
			key={Math.floor(Math.random() * 9999999).toString()}
			style={styles.channelListHeader}
		>
			<View style={styles.channelListHeaderItem}>
				<AngleDownIcon width={20} height={20} style={[props?.isCollapsed && { transform: [{ rotate: '-90deg' }] }]} />
				<Text style={styles.channelListHeaderItemTitle}>{props.title}</Text>
			</View>
		</TouchableOpacity>
	);
});

export const ChannelListSection = React.memo((props: { data: ICategoryChannel; index: number; onPressHeader: any; collapseItems: any }) => {
	const isCollapsed = props?.collapseItems?.includes?.(props?.index?.toString?.());
	const currentChanel = useSelector(selectCurrentChannel);

	return (
		<View key={Math.floor(Math.random() * 9999999).toString()} style={styles.channelListSection}>
			<ChannelListHeader
				title={props.data.category_name}
				onPress={() => props?.onPressHeader?.(props?.index?.toString?.())}
				isCollapsed={isCollapsed}
			/>
			<View style={{ display: isCollapsed ? 'none' : 'flex' }}>
				{props.data.channels?.map((item: any, index: number) => {
					const isActive = currentChanel?.id === item.id;

					return (
						<ChannelListItem
							data={item}
							key={Math.floor(Math.random() * 9999999).toString() + index}
							isActive={isActive}
							currentChanel={currentChanel}
						/>
					);
				})}
			</View>
		</View>
	);
});

export const FriendListItem = React.memo((props: { user: IUser }) => {
	const { user } = props;

	const inviteFriend = (user: IUser) => {
		console.log('invited:', user);
	}

	return (
		<View style={styles.friendItemWrapper}>
			<View style={styles.friendItemContent}>
				<FastImage
					style={{ width: 40, height: 40, borderRadius: 50 }}
					source={{
						uri: user?.avatarSm,
					}}
					resizeMode={FastImage.resizeMode.cover}
				/>
				<Text style={styles.friendItemName}>{user?.name}</Text>
			</View>
		
			<View>
				<MezonButton
					viewContainerStyle={styles.inviteButton}
					onPress={() => inviteFriend(user)}
				>Invite</MezonButton>
			</View>
		</View>
	);
});
