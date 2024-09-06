import { useChatMessages, useMemberStatus } from '@mezon/core';
import { ActionEmitEvent, Icons, STORAGE_CLAN_ID, STORAGE_IS_DISABLE_LOAD_BACKGROUND, save } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import {
	appActions,
	channelMembersActions,
	clansActions,
	directActions,
	getStoreAsync,
	selectCurrentChannel,
	selectCurrentClanId,
	selectDmGroupCurrent,
	useAppDispatch
} from '@mezon/store-mobile';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, DeviceEventEmitter, Image, Platform, Pressable, Text, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessagesWrapper from '../../home/homedrawer/ChannelMessagesWrapper';
import { ChatBox } from '../../home/homedrawer/ChatBox';
import PanelKeyboard from '../../home/homedrawer/PanelKeyboard';
import { IModeKeyboardPicker } from '../../home/homedrawer/components';
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
	const currentClanId = useSelector(selectCurrentClanId);
	const userStatus = useMemberStatus(currentDmGroup?.user_id?.length === 1 ? currentDmGroup?.user_id[0] : '');
	const isMentionHashtagDMRef = useRef(false);
	const panelKeyboardRef = useRef(null);

	const onShowKeyboardBottomSheet = useCallback((isShow: boolean, height: number, type?: IModeKeyboardPicker) => {
		if (panelKeyboardRef?.current) {
			panelKeyboardRef.current?.onShowKeyboardBottomSheet(isShow, height, type);
		}
	}, []);

	const navigateToThreadDetail = () => {
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET, params: { directMessage: currentDmGroup } });
	};

	const fetchMemberChannel = useCallback(async () => {
		if (!currentChannel) {
			return;
		}
		const store = await getStoreAsync();
		store.dispatch(clansActions.setCurrentClanId(currentChannel?.clan_id));
		// Rejoin previous clan (other than 0) when exiting the DM detail screen
		store.dispatch(clansActions.joinClan({ clanId: currentChannel?.clan_id }));
		store.dispatch(
			channelMembersActions.fetchChannelMembers({
				clanId: currentChannel?.clan_id || '',
				channelId: currentChannel?.channel_id || '',
				channelType: currentChannel?.type,
				noCache: true
			})
		);
	}, [currentChannel]);

	const directMessageLoader = useCallback(async () => {
		const store = await getStoreAsync();
		store.dispatch(clansActions.setCurrentClanId('0'));
		store.dispatch(
			directActions.joinDirectMessage({
				directMessageId: currentDmGroup?.id,
				channelName: currentDmGroup?.channel_label || currentDmGroup?.usernames,
				type: currentDmGroup?.type,
				noCache: true,
				isFetchingLatestMessages: true
			})
		);
		save(STORAGE_CLAN_ID, currentChannel?.clan_id);
	}, [currentChannel?.clan_id, currentDmGroup?.channel_label, currentDmGroup?.id, currentDmGroup?.type, currentDmGroup?.usernames]);

	useEffect(() => {
		const onMentionHashtagDM = DeviceEventEmitter.addListener(ActionEmitEvent.ON_MENTION_HASHTAG_DM, ({ isMentionHashtagDM }) => {
			isMentionHashtagDMRef.current = isMentionHashtagDM;
		});
		return () => {
			onMentionHashtagDM.remove();
		};
	}, []);

	useEffect(() => {
		return () => {
			if (!isMentionHashtagDMRef.current) {
				fetchMemberChannel();
			}
		};
	}, [fetchMemberChannel, isMentionHashtagDMRef]);

	useEffect(() => {
		if (currentDmGroup?.id) {
			directMessageLoader();
		}
	}, [currentDmGroup?.id, currentDmGroup?.clan_id]);

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			appStateSubscription.remove();
		};
	}, [currentDmGroup?.id, currentDmGroup?.clan_id, directMessageId]);

	const handleAppStateChange = async (state: string) => {
		if (state === 'active') {
			try {
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: false });
				const store = await getStoreAsync();
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, true);
				await store.dispatch(
					directActions.joinDirectMessage({
						directMessageId: currentDmGroup.id,
						channelName: currentDmGroup?.channel_label || currentDmGroup?.usernames,
						type: currentDmGroup.type,
						noCache: true,
						isFetchingLatestMessages: true
					})
				);

				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			} catch (error) {
				console.log('error messageLoaderBackground', error);
				const store = await getStoreAsync();
				store.dispatch(appActions.setIsFromFCMMobile(false));
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			}
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

	const onHandlerStateChange = (event) => {
		const { translationX, velocityX } = event.nativeEvent;
		if (translationX > 5 && velocityX > 200) {
			handleBack();
		}
	};
	return (
		<SafeAreaView edges={['top']} style={styles.dmMessageContainer}>
			<View style={styles.headerWrapper}>
				<Pressable onPress={() => handleBack()} style={styles.backButton}>
					<Icons.ArrowLargeLeftIcon color={themeValue.text} height={size.s_20} width={size.s_20} />
				</Pressable>
				<Pressable style={styles.channelTitle} onPress={() => navigateToThreadDetail()}>
					{currentDmGroup?.channel_avatar?.length > 1 ? (
						<View style={styles.groupAvatar}>
							<Icons.GroupIcon width={18} height={18} />
						</View>
					) : (
						<View style={styles.avatarWrapper}>
							{currentDmGroup?.channel_avatar?.[0] ? (
								<Image source={{ uri: currentDmGroup?.channel_avatar?.[0] || '' }} style={styles.friendAvatar} />
							) : (
								<View style={styles.wrapperTextAvatar}>
									<Text style={[styles.textAvatar]}>
										{(currentDmGroup?.channel_label || currentDmGroup?.usernames)?.charAt?.(0)}
									</Text>
								</View>
							)}
							<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
						</View>
					)}
					<Text style={styles.titleText} numberOfLines={1}>
						{currentDmGroup?.channel_label || currentDmGroup?.usernames}
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
					<PanGestureHandler failOffsetY={[-5, 5]} onHandlerStateChange={onHandlerStateChange}>
						<View style={{ flex: 1 }}>
							<ChannelMessagesWrapper
								channelId={currentDmGroup.id}
								clanId={'0'}
								mode={Number(
									currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP
								)}
								isPublic={false}
							/>
						</View>
					</PanGestureHandler>
					<ChatBox
						channelId={currentDmGroup?.id}
						mode={Number(currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)}
						onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
						hiddenIcon={{
							threadIcon: true
						}}
					/>
					<Block height={Platform.OS === 'ios' ? 10 : 0} backgroundColor={themeValue.secondary} />
					<PanelKeyboard
						ref={panelKeyboardRef}
						directMessageId={currentDmGroup?.id || ''}
						currentChannelId={directMessageId}
						currentClanId={currentClanId}
					/>
				</View>
			) : null}
		</SafeAreaView>
	);
};
