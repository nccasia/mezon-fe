import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useChannelMembersOnlineStatus } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import { DirectEntity } from '@mezon/store-mobile';
import { ChannelMembersEntity } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { ChannelType } from 'mezon-js';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { InviteToChannel } from '../../screens/home/homedrawer/components/InviteToChannel';
import { threadDetailContext } from '../ThreadDetail/MenuThreadDetail';
import { UserInformationBottomSheet } from '../UserInformationBottomSheet';
import MemberItem from './MemberItem';
import style from './style';

enum EActionButton {
	AddMembers = 'Add Members',
	InviteMembers = 'Invite Members'
}

export const MemberListStatus = React.memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChannel = useContext(threadDetailContext);
	const navigation = useNavigation<any>();
	const { onlineMembers, offlineMembers } = useChannelMembersOnlineStatus({ channelId: currentChannel?.id });
	const [selectedUser, setSelectedUser] = useState<ChannelMembersEntity | null>(null);
	const { t } = useTranslation();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);
	const handleAddOrInviteMembers = useCallback((action: EActionButton) => {
		if (action === EActionButton.InviteMembers) bottomSheetRef?.current?.present();
		if (action === EActionButton.AddMembers) navigateToNewGroupScreen();
	}, []);

	const navigateToNewGroupScreen = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
			screen: APP_SCREEN.MESSAGES.NEW_GROUP,
			params: { directMessage: currentChannel as DirectEntity }
		});
	};

	const onClose = useCallback(() => {
		setSelectedUser(null);
	}, []);

	const handleUserPress = useCallback((user) => {
		setSelectedUser(user);
	}, []);

	const renderMemberItem = ({ item, index }) => {
		return (
			<MemberItem
				onPress={handleUserPress}
				user={item}
				key={`memberItem[${item?.user?.id}][${index}]`}
				isOffline={!item?.user?.online}
				currentChannel={currentChannel}
				isDMThread={isDMThread}
			/>
		);
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{currentChannel?.type === ChannelType.CHANNEL_TYPE_DM ? (
				<TouchableOpacity onPress={() => navigateToNewGroupScreen()} style={styles.actionItem}>
					<View style={[styles.actionIconWrapper]}>
						<Icons.GroupIcon height={20} width={20} color={baseColor.white} />
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.actionTitle}>{t('message:newMessage.newGroup')}</Text>
						<Text style={styles.newGroupContent} numberOfLines={1}>
							{t('message:newMessage.createGroupWith')} {currentChannel?.channel_label}
						</Text>
					</View>
					<Icons.ChevronSmallRightIcon height={15} width={15} color={themeValue.text} />
				</TouchableOpacity>
			) : null}

			{currentChannel?.type !== ChannelType.CHANNEL_TYPE_DM ? (
				<Pressable
					onPress={() => {
						handleAddOrInviteMembers(isDMThread ? EActionButton.AddMembers : EActionButton.InviteMembers);
					}}
				>
					<View style={styles.inviteBtn}>
						<View style={styles.iconNameWrapper}>
							<View style={styles.iconWrapper}>
								<Icons.UserPlusIcon height={20} width={20} color={baseColor.white} />
							</View>
							<Text style={styles.text}>{isDMThread ? EActionButton.AddMembers : EActionButton.InviteMembers}</Text>
						</View>
						<View>
							<Icons.ChevronSmallRightIcon height={15} width={15} color={themeValue.text} />
						</View>
					</View>
				</Pressable>
			) : null}

			<View>
				{onlineMembers?.length > 0 && (
					<View>
						<Text style={styles.text}>Member - {onlineMembers?.length || '0'}</Text>
						<View style={styles.box}>
							<FlashList
								data={onlineMembers}
								keyExtractor={(user, index) => `channelOnlineMember[${user?.id}][${index}]`}
								renderItem={renderMemberItem}
								estimatedItemSize={size.s_80}
								nestedScrollEnabled
							/>
						</View>
					</View>
				)}
				{offlineMembers?.length > 0 && (
					<View style={{ marginTop: 20 }}>
						<Text style={styles.text}>Offline - {offlineMembers?.length}</Text>
						<View style={styles.box}>
							<FlashList
								data={offlineMembers}
								keyExtractor={(user, index) => `channelOfflineMember[${user?.id}][${index}]`}
								renderItem={renderMemberItem}
								estimatedItemSize={size.s_80}
								nestedScrollEnabled
							/>
						</View>
					</View>
				)}
			</View>
			<UserInformationBottomSheet userId={selectedUser?.user?.id} onClose={onClose} />
			<InviteToChannel isUnknownChannel={false} ref={bottomSheetRef} isDMThread={isDMThread} />
		</ScrollView>
	);
});
