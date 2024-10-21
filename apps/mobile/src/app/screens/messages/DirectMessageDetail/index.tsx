import { useMemberStatus } from '@mezon/core';
import { ActionEmitEvent, STORAGE_CLAN_ID, STORAGE_IS_DISABLE_LOAD_BACKGROUND, save } from '@mezon/mobile-components';
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import {
	appActions,
	channelMembersActions,
	clansActions,
	directActions,
	getStoreAsync,
	messagesActions,
	selectCurrentChannel,
	selectCurrentClanId,
	selectDmGroupCurrent
} from '@mezon/store-mobile';
import { ChannelType } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, DeviceEventEmitter, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { ChatMessageWrapper } from '../ChatMessageWrapper';
import HeaderDirectMessage from './HeaderDirectMessage';
import { style } from './styles';

export const DirectMessageDetailScreen = ({ navigation, route }: { navigation: any; route: any }) => {
	const { themeValue, themeBasic } = useTheme();
	const styles = style(themeValue);
	const directMessageId = route.params?.directMessageId as string;

	const from = route.params?.from;
	const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageId ?? ''));
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const isFetchMemberChannelDmRef = useRef(false);
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

	const navigateToThreadDetail = useCallback(() => {
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET, params: { directMessage: currentDmGroup } });
	}, [currentDmGroup, navigation]);

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
		const focusedListener = navigation.addListener('focus', () => {
			StatusBar.setBackgroundColor(themeValue.primary);
			StatusBar.setBarStyle(themeBasic === ThemeModeBase.DARK ? 'light-content' : 'dark-content');
		});
		const blurListener = navigation.addListener('blur', () => {
			StatusBar.setBackgroundColor(themeValue.secondary);
			StatusBar.setBarStyle(themeBasic === ThemeModeBase.DARK ? 'light-content' : 'dark-content');
		});
		return () => {
			focusedListener();
			blurListener();
		};
	}, [navigation, themeBasic, themeValue.primary, themeValue.secondary]);

	useEffect(() => {
		const onMentionHashtagDM = DeviceEventEmitter.addListener(ActionEmitEvent.FETCH_MEMBER_CHANNEL_DM, ({ isFetchMemberChannelDM }) => {
			isFetchMemberChannelDmRef.current = isFetchMemberChannelDM;
		});
		return () => {
			onMentionHashtagDM.remove();
		};
	}, []);

	useEffect(() => {
		return () => {
			if (!isFetchMemberChannelDmRef.current) {
				requestAnimationFrame(async () => {
					await fetchMemberChannel();
				});
			}
		};
	}, [fetchMemberChannel, isFetchMemberChannelDmRef]);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (directMessageId) {
			timeout = setTimeout(() => {
				requestAnimationFrame(async () => {
					await directMessageLoader();
				});
			}, 100);
		}

		return () => {
			timeout && clearTimeout(timeout);
		};
	}, [directMessageId, directMessageLoader]);

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
					messagesActions.fetchMessages({
						channelId: directMessageId,
						noCache: true,
						isFetchingLatestMessages: true,
						isClearMessage: true,
						clanId: '0'
					})
				);
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			} catch (error) {
				const store = await getStoreAsync();
				store.dispatch(appActions.setIsFromFCMMobile(false));
				save(STORAGE_IS_DISABLE_LOAD_BACKGROUND, false);
				DeviceEventEmitter.emit(ActionEmitEvent.SHOW_SKELETON_CHANNEL_MESSAGE, { isShow: true });
			}
		}
	};

	const handleBack = useCallback(() => {
		if (APP_SCREEN.MESSAGES.NEW_GROUP === from) {
			navigation.navigate(APP_SCREEN.MESSAGES.HOME);
			return;
		}
		navigation.goBack();
	}, [from, navigation]);

	return (
		<SafeAreaView edges={['top']} style={styles.dmMessageContainer}>
			<HeaderDirectMessage
				handleBack={handleBack}
				navigateToThreadDetail={navigateToThreadDetail}
				isTypeDMGroup={isTypeDMGroup}
				dmAvatar={dmAvatar}
				dmLabel={dmLabel}
				userStatus={userStatus}
				styles={styles}
				themeValue={themeValue}
				directMessageId={directMessageId}
			/>
			{directMessageId && (
				<ChatMessageWrapper handleBack={handleBack} directMessageId={directMessageId} isModeDM={isModeDM} currentClanId={currentClanId} />
			)}
		</SafeAreaView>
	);
};
