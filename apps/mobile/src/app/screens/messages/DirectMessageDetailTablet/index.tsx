import { useChatMessages, useMemberStatus } from '@mezon/core';
import { ActionEmitEvent, Icons, STORAGE_CLAN_ID, STORAGE_IS_DISABLE_LOAD_BACKGROUND, save } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { directMetaActions } from '@mezon/store';
import {
	appActions,
	channelMembersActions,
	clansActions,
	directActions,
	getStoreAsync,
	messagesActions,
	selectCurrentChannel,
	selectCurrentClanId,
	selectDmGroupCurrent,
	useAppDispatch
} from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, DeviceEventEmitter, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { ChatMessageWrapper } from '../ChatMessageWrapper';
import { style } from './styles';

function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();
	const { lastMessage } = useChatMessages({ channelId });
	const mounted = useRef('');
	useEffect(() => {
		if (lastMessage) {
			if (mounted.current === channelId) {
				return;
			}
			const timestamp = Date.now() / 1000;
			dispatch(directMetaActions.setDirectLastSeenTimestamp({ channelId, timestamp: timestamp }));
			dispatch(directMetaActions.updateLastSeenTime(lastMessage));
			dispatch(directMetaActions.setDirectMetaLastSeenTimestamp({ channelId, timestamp: timestamp }));
		}
	}, [channelId, dispatch, lastMessage]);
}

export const DirectMessageDetailTablet = ({ directMessageId }: {directMessageId?: string}) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const navigation = useNavigation<any>();

	const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageId ?? ''));
	useChannelSeen(directMessageId || '');

	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const isMentionHashtagDMRef = useRef(false);
	const isModeDM = useMemo(() => {
		return currentDmGroup?.user_id?.length === 1;
	}, [currentDmGroup?.user_id?.length]);

	const isTypeDMGroup = useMemo(() => {
		return Number(currentDmGroup?.type) === ChannelType.CHANNEL_TYPE_GROUP;
	}, [currentDmGroup?.type]);

	const dmType = useMemo(() => {
		return currentDmGroup?.type;
	}, [currentDmGroup?.type]);

	const dmLabel = useMemo(() => {
		return currentDmGroup?.channel_label || currentDmGroup?.usernames || '';
	}, [currentDmGroup?.channel_label, currentDmGroup?.usernames]);

	const dmAvatar = useMemo(() => {
		return currentDmGroup?.channel_avatar?.[0];
	}, [currentDmGroup?.channel_avatar?.[0]]);

	const firstUserId = useMemo(() => {
		return currentDmGroup?.user_id?.[0];
	}, [currentDmGroup?.user_id?.[0]]);

	const userStatus = useMemberStatus(isModeDM ? firstUserId : '');

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
		await Promise.all([
			store.dispatch(clansActions.setCurrentClanId('0')),
			store.dispatch(
				directActions.joinDirectMessage({
					directMessageId: directMessageId,
					type: dmType,
					noCache: true,
					isFetchingLatestMessages: true,
					isClearMessage: true
				})
			)
		]);
		save(STORAGE_CLAN_ID, currentChannel?.clan_id);
	}, [currentChannel?.clan_id, directMessageId, dmType]);

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
		let timeout: NodeJS.Timeout;
		if (directMessageId) {
			timeout = setTimeout(() => {
				directMessageLoader();
			}, 100);
		}

		return () => {
			timeout && clearTimeout(timeout);
		};
	}, [directMessageId]);

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			appStateSubscription.remove();
		};
	}, [directMessageId, directMessageId]);

	const handleAppStateChange = async (state: string) => {
		if (state === 'active') {
			try {
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: false });
				const store = await getStoreAsync();
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, true);
				store.dispatch(
					messagesActions.fetchMessages({ channelId: directMessageId, noCache: true, isFetchingLatestMessages: true, isClearMessage: true })
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

	return (
		<SafeAreaView edges={['top']} style={styles.dmMessageContainer}>
			<View style={styles.headerWrapper}>
				<Pressable style={styles.channelTitle} onPress={() => navigateToThreadDetail()}>
					{isTypeDMGroup ? (
						<View style={styles.groupAvatar}>
							<Icons.GroupIcon width={18} height={18} />
						</View>
					) : (
						<View style={styles.avatarWrapper}>
							{dmAvatar ? (
								<Image source={{ uri: dmAvatar || '' }} style={styles.friendAvatar} />
							) : (
								<View style={styles.wrapperTextAvatar}>
									<Text style={[styles.textAvatar]}>{dmLabel?.charAt?.(0)}</Text>
								</View>
							)}
							<View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
						</View>
					)}
					<Text style={styles.titleText} numberOfLines={1}>
						{dmLabel}
					</Text>
				</Pressable>
				<View style={styles.actions}>
					{/* TODO: update later */}
					{/* <CallIcon />
                    <VideoIcon /> */}
				</View>
			</View>
			{directMessageId && (
				<ChatMessageWrapper directMessageId={directMessageId} isModeDM={isModeDM} currentClanId={currentClanId} />
			)}
		</SafeAreaView>
	);
};
