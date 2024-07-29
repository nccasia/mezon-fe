import BottomSheet from '@gorhom/bottom-sheet';
import { useChatMessages, useMemberStatus } from '@mezon/core';
import {
	ActionEmitEvent,
	Icons,
	save,
	STORAGE_CLAN_ID,
	STORAGE_IS_DISABLE_LOAD_BACKGROUND
} from '@mezon/mobile-components';
import { Block, useTheme } from '@mezon/mobile-ui';
import {
	appActions,
	channelMembersActions,
	clansActions,
	directActions,
	getStoreAsync,
	messagesActions,
	selectCurrentChannel,
	selectDmGroupCurrent,
	useAppDispatch,
} from '@mezon/store-mobile';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, DeviceEventEmitter, Image, Platform, Pressable, Text, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessages from '../../home/homedrawer/ChannelMessages';
import { ChatBox } from '../../home/homedrawer/ChatBox';
import { IModeKeyboardPicker } from '../../home/homedrawer/components';
import AttachmentPicker from '../../home/homedrawer/components/AttachmentPicker';
import BottomKeyboardPicker from '../../home/homedrawer/components/BottomKeyboardPicker';
import EmojiPicker from '../../home/homedrawer/components/EmojiPicker';
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
	const [heightKeyboardShow, setHeightKeyboardShow] = useState<number>(0);
	const [typeKeyboardBottomSheet, setTypeKeyboardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const bottomPickerRef = useRef<BottomSheet>(null);

	const onShowKeyboardBottomSheet = useCallback((isShow: boolean, height: number, type?: IModeKeyboardPicker) => {
		setHeightKeyboardShow(height);
		if (isShow) {
			setTypeKeyboardBottomSheet(type);
			bottomPickerRef.current?.collapse();
		} else {
			setTypeKeyboardBottomSheet('text');
			bottomPickerRef.current?.close();
		}
	}, []);

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
				isFetchingLatestMessages: true,
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
				store.dispatch(appActions.setIsFromFCMMobile(true));
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, true);
				await store.dispatch(
					directActions.joinDirectMessage({
						directMessageId: currentDmGroup.id,
						channelName: currentDmGroup.channel_label,
						type: currentDmGroup.type,
						noCache: true,
						isFetchingLatestMessages: true,
					}),
				);
				
				store.dispatch(appActions.setIsFromFCMMobile(false));
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
			handleBack()
		}
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
						<View style={styles.avatarWrapper}>
							{currentDmGroup?.channel_avatar?.[0] ? (
								<Image source={{ uri: currentDmGroup?.channel_avatar?.[0] || '' }} style={styles.friendAvatar} />
							) : (
								<Text style={[styles.textAvatar]}>{currentDmGroup?.channel_label?.charAt?.(0)}</Text>
							)}
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
					<PanGestureHandler
						failOffsetY={[-5, 5]}
						onHandlerStateChange={onHandlerStateChange}
					>
						<View style={{ flex: 1 }}>
							<ChannelMessages
								channelId={currentDmGroup.id}
								channelLabel={currentDmGroup?.channel_label}
								mode={Number(currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)}
							/>
						</View>
					</PanGestureHandler>
					<ChatBox
						channelId={currentDmGroup?.id}
						mode={Number(currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)}
						onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
						hiddenIcon={{
							threadIcon: true,
						}}
					/>
					<Block height={Platform.OS === 'ios' ? 10 : 0} backgroundColor={themeValue.secondary} />
					<View
						style={{
							height: Platform.OS === 'ios' || typeKeyboardBottomSheet !== 'text' ? heightKeyboardShow : 0,
							backgroundColor: themeValue.secondary,
						}}
					/>
					{heightKeyboardShow !== 0 && typeKeyboardBottomSheet !== 'text' && (
						<BottomKeyboardPicker height={heightKeyboardShow} ref={bottomPickerRef} isStickyHeader={typeKeyboardBottomSheet === 'emoji'}>
							{typeKeyboardBottomSheet === 'emoji' ? (
								<EmojiPicker
									onDone={() => {
										onShowKeyboardBottomSheet(false, heightKeyboardShow, 'text');
										DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, {});
									}}
									bottomSheetRef={bottomPickerRef}
								/>
							) : typeKeyboardBottomSheet === 'attachment' ? (
								<AttachmentPicker currentChannelId={directMessageId} currentClanId={currentChannel?.clan_id} />
							) : (
								<View />
							)}
						</BottomKeyboardPicker>
					)}
				</View>
			) : null}
		</SafeAreaView>
	);
};
