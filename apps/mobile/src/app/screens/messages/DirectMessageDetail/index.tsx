import { useChatMessages, useMemberStatus } from '@mezon/core';
import { Icons, STORAGE_CLAN_ID, save } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import {
	channelMembersActions,
	clansActions,
	directActions,
	getStoreAsync,
	selectCurrentChannel,
	selectDmGroupCurrent,
	useAppDispatch,
} from '@mezon/store-mobile';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useEffect } from 'react';
import { AppState, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessages from '../../home/homedrawer/ChannelMessages';
import { ChatBox } from '../../home/homedrawer/ChatBox';
import { style } from './styles';

function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();
	const { lastMessage } = useChatMessages({ channelId });
	useEffect(() => {
		if (lastMessage) {
			const timestamp = Date.now() / 1000;
			dispatch(directActions.setDirectLastSeenTimestamp({ channelId, timestamp: timestamp }));
			dispatch(directActions.updateLastSeenTime(lastMessage));
		}
	}, [channelId, dispatch, lastMessage]);
}

export const DirectMessageDetailScreen = ({ navigation, route }: { navigation: any; route: any }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const directMessageId = route.params?.directMessageId as string;
	const from = route.params?.from;
	const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageId ?? ''));
	const dispatch = useAppDispatch();
	useChannelSeen(directMessageId || '');
	const currentChannel = useSelector(selectCurrentChannel);
	const userStatus = useMemberStatus(currentDmGroup?.user_id?.length === 1 ? currentDmGroup?.user_id[0] : '');

	const navigateToThreadDetail = () => {
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET, params: { directMessage: currentDmGroup } });
	};

	const fetchMemberChannel = useCallback(async () => {
		if (!currentChannel) {
			return;
		}
		await dispatch(
			channelMembersActions.fetchChannelMembers({
				clanId: currentChannel?.clan_id || '',
				channelId: currentChannel?.channel_id || '',
				channelType: currentChannel?.type,
				noCache: true,
			}),
		);
	}, [currentChannel, dispatch]);

	const directMessageLoader = useCallback(async () => {
		const store = await getStoreAsync();
		store.dispatch(clansActions.joinClan({ clanId: currentDmGroup?.clan_id }));
		save(STORAGE_CLAN_ID, currentDmGroup?.clan_id);
		store.dispatch(
			directActions.joinDirectMessage({
				directMessageId: currentDmGroup.id,
				channelName: currentDmGroup.channel_label,
				type: currentDmGroup.type,
				noCache: true,
			}),
		);
		return null;
	}, [currentDmGroup]);

	useEffect(() => {
		return () => {
			fetchMemberChannel();
		};
	}, [fetchMemberChannel]);

	useEffect(() => {
		if (currentDmGroup?.id) {
			directMessageLoader();
		}
	}, [currentDmGroup?.id]);

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			appStateSubscription.remove();
		};
	}, [currentDmGroup?.id]);

	const handleAppStateChange = async (state: string) => {
		if (state === 'active') {
			await fetchMemberChannel();
			await directMessageLoader();
		}
	};

	useEffect(() => {
		if (from && from === APP_SCREEN.HOME) {
			dispatch(directActions.fetchDirectMessage({ noCache: true }));
		}
	}, [from]);

	const handleBack = () => {
		if (APP_SCREEN.MESSAGES.NEW_GROUP === from) {
			navigation.navigate(APP_SCREEN.MESSAGES.HOME);
			return;
		}
		dispatch(directActions.setDmGroupCurrentId(''));
		navigation.goBack();
	};
	return (
		<SafeAreaView edges={['top']} style={styles.dmMessageContainer}>
			<View style={styles.headerWrapper}>
				<Pressable onPress={() => handleBack()} style={styles.backButton}>
					<Icons.ArrowLargeLeftIcon color={themeValue.text} height={20} width={20} />
				</Pressable>
				<Pressable style={styles.channelTitle} onPress={() => navigateToThreadDetail()}>
					{currentDmGroup?.channel_avatar?.length > 1 ? (
						<View style={styles.groupAvatar}>
							<Icons.GroupIcon width={18} height={18} />
						</View>
					) : (
						<View>
							<Image source={{ uri: currentDmGroup?.channel_avatar?.[0] || '' }} style={styles.friendAvatar} />
							<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
						</View>
					)}
					<Text style={styles.titleText} numberOfLines={1}>
						{currentDmGroup?.channel_label}
					</Text>
				</Pressable>
				<View style={styles.actions}>
					{/* TODO: update later */}
					{/* <CallIcon />
                    <VideoIcon /> */}
				</View>
			</View>

			{currentDmGroup?.id ? (
				<View style={styles.content}>
					<ChannelMessages
						channelId={currentDmGroup.id}
						channelLabel={currentDmGroup?.channel_label}
						mode={Number(currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)}
					/>
					<ChatBox
						channelId={currentDmGroup?.id}
						mode={Number(currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)}
					/>
				</View>
			) : null}
		</SafeAreaView>
	);
};
