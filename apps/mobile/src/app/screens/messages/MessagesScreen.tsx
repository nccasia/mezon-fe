import moment from 'moment';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { MessageIcon, UserPlusIcon } from '@mezon/mobile-components';
import { Colors, size } from '@mezon/mobile-ui';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { useDirect, useMemberStatus } from '@mezon/core';
import { IChannel } from '@mezon/utils';
import { normalizeString } from '../../utils/helpers';

const SeparatorListFriend = () => {
	return (
		<View style={{height: size.s_8}} />
	)
}

const DmListItem = (props: { directMessage: IChannel}) => {
	const { directMessage } = props;

	const lastMessage = JSON.parse(directMessage.last_sent_message.content);
	const timestamp = Number(directMessage.last_sent_message.timestamp);
	const userStatus = useMemberStatus(directMessage?.user_id?.length === 1 ? directMessage?.user_id[0] : '');

	const redirectToMessageDetail = () => {
		//TODO: update later
		console.log('message detail', directMessage);
	}

	return (
		<TouchableOpacity style={styles.messageItem} onPress={() => redirectToMessageDetail()}>
			<View>
				<Image source={{ uri: directMessage.channel_avatar[0] }} style={styles.friendAvatar} />
				<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
			</View>
			<View style={{ flex: 1 }}>
				<View style={styles.messageContent}>
					<Text style={styles.defaultText}>{directMessage.channel_label}</Text>
					<Text style={styles.defaultText}>{moment.unix(timestamp).format('DD/MM/YYYY HH:mm')}</Text>
				</View>

				<Text style={styles.defaultText}>
					{lastMessage.t}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

const MessagesScreen = ({ navigation }: { navigation: any }) => {
	const [searchText, setSearchText] = useState<string>('');
	const { listDM: dmGroupChatList } = useDirect();
	const { t } = useTranslation(['dmMessage']);

	const filterDmGroupsByChannelLabel = (data: IChannel[]) => {
		const uniqueLabels = new Set();
		return data.filter((obj: IChannel) => {
			const isUnique = !uniqueLabels.has(obj.channel_label);
			uniqueLabels.add(obj.channel_label);
			return isUnique;
		});
	};

	const filteredDataDM = filterDmGroupsByChannelLabel(dmGroupChatList).filter(dm => normalizeString(dm.channel_label).includes(normalizeString(searchText)));

	const navigateToAddFriendScreen = () => {
		navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.ADD_FRIEND });
	}

	return (
		<View style={styles.container}>
			<View style={styles.headerWrapper}>
				<Text style={styles.headerTitle}>{t('title')}</Text>
				<Pressable style={styles.addFriendWrapper} onPress={() => navigateToAddFriendScreen()}>
					<UserPlusIcon height={15} width={30} />
					<Text style={styles.addFriendText}>{t('addFriend')}</Text>
				</Pressable>
			</View>
			
			<View style={styles.searchMessage}>
				<Feather size={18} name="search" style={{ color: Colors.tertiary }} />
				<TextInput
					placeholder={t('searchPlaceHolder')}
					placeholderTextColor={Colors.tertiary}
					style={styles.searchInput}
					onChangeText={setSearchText}
				/>
			</View>

			<FlatList
				data={filteredDataDM}
				style={styles.dmMessageListContainer}
				keyExtractor={(dm) => dm.id.toString()}
				ItemSeparatorComponent={SeparatorListFriend}
				renderItem={({ item }) => <DmListItem directMessage={item} key={item.id} />}
			/>

			<Pressable style={styles.addMessage}>
				<MessageIcon width={32} height={25} style={{marginLeft: -5}} />
			</Pressable>
		</View>
	);
};

export default MessagesScreen;
