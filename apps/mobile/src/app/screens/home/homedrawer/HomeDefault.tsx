import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ENotificationActive, EOpenSearchChannelFrom, Icons, STORAGE_AGREED_POLICY, load, save } from '@mezon/mobile-components';
import { Colors, size, useTheme } from '@mezon/mobile-ui';
import {
	ChannelsEntity,
	RootState,
	channelMembersActions,
	channelMetaActions,
	channelsActions,
	clansActions,
	selectAllClans,
	selectAnyUnreadChannels,
	selectChannelById,
	selectCurrentChannel,
	selectFetchChannelStatus,
	useAppDispatch
} from '@mezon/store-mobile';
import { ChannelStatusEnum, TIME_OFFSET, isPublicChannel } from '@mezon/utils';
import { useDrawerStatus } from '@react-navigation/drawer';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { setTimeout } from '@testing-library/react-native/build/helpers/timers';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonBottomSheet from '../../../componentUI/MezonBottomSheet';
import NotificationSetting from '../../../components/NotificationSetting';
import useStatusMuteChannel from '../../../hooks/useStatusMuteChannel';
import useTabletLandscape from '../../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessagesWrapper from './ChannelMessagesWrapper';
import { ChatBox } from './ChatBox';
import PanelKeyboard from './PanelKeyboard';
import { IModeKeyboardPicker } from './components';
import LicenseAgreement from './components/LicenseAgreement';
import { style } from './styles';

function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();
	const currentChannel = useSelector(selectChannelById(channelId));
	const statusFetchChannel = useSelector(selectFetchChannelStatus);
	const resetBadgeCount = !useSelector(selectAnyUnreadChannels);
	useEffect(() => {
		const timestamp = Date.now() / 1000;
		dispatch(channelMetaActions.setChannelLastSeenTimestamp({ channelId, timestamp: timestamp + TIME_OFFSET }));
	}, [channelId, currentChannel, dispatch]);

	useEffect(() => {
		if (!statusFetchChannel) return;
		const numberNotification = currentChannel?.count_mess_unread ? currentChannel?.count_mess_unread : 0;
		if (numberNotification && numberNotification > 0) {
			dispatch(channelsActions.updateChannelBadgeCount({ channelId: channelId, count: numberNotification * -1 }));
			dispatch(clansActions.updateClanBadgeCount({ clanId: currentChannel?.clan_id ?? '', count: numberNotification * -1 }));
		}
		if (!numberNotification && resetBadgeCount) {
			dispatch(clansActions.updateClanBadgeCount({ clanId: currentChannel?.clan_id ?? '', count: 0, isReset: true }));
		}
	}, [channelId, currentChannel?.clan_id, currentChannel?.count_mess_unread, currentChannel?.id, dispatch, resetBadgeCount, statusFetchChannel]);
}

const HomeDefault = React.memo((props: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChannel = useSelector(selectCurrentChannel);
	const parent = useSelector(selectChannelById(currentChannel?.parrent_id || ''));
	const timeoutRef = useRef<any>(null);
	const [isFocusChannelView, setIsFocusChannelView] = useState(false);
	const [isShowLicenseAgreement, setIsShowLicenseAgreement] = useState<boolean>(false);
	const navigation = useNavigation<any>();

	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);
	const clans = useSelector(selectAllClans);
	const dispatch = useAppDispatch();
	const panelKeyboardRef = useRef(null);
	const prevChannelIdRef = useRef<string>();

	useChannelSeen(currentChannel?.channel_id || '');
	const onShowKeyboardBottomSheet = useCallback((isShow: boolean, height: number, type?: IModeKeyboardPicker) => {
		if (panelKeyboardRef?.current) {
			panelKeyboardRef.current?.onShowKeyboardBottomSheet(isShow, height, type);
		}
	}, []);

	const isChannelApp = useMemo(() => currentChannel?.type === ChannelType?.CHANNEL_TYPE_APP, [currentChannel?.type]);

	const onOpenDrawer = useCallback(() => {
		onShowKeyboardBottomSheet(false, 0, 'text');
		navigation.dispatch(DrawerActions.openDrawer());
		Keyboard.dismiss();
	}, [navigation, onShowKeyboardBottomSheet]);

	useEffect(() => {
		if (clansLoadingStatus === 'loaded' && !clans?.length) onOpenDrawer();
	}, [clans, clansLoadingStatus, onOpenDrawer]);

	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ['50%'], []);
	const [isShowSettingNotifyBottomSheet, setIsShowSettingNotifyBottomSheet] = useState<boolean>(false);

	const openBottomSheet = () => {
		Keyboard.dismiss();
		setIsShowSettingNotifyBottomSheet(!isShowSettingNotifyBottomSheet);
		timeoutRef.current = setTimeout(() => {
			bottomSheetRef.current?.present();
		}, 200);
	};
	const drawerStatus = useDrawerStatus();

	useEffect(() => {
		const backAction = () => {
			if (drawerStatus === 'closed') {
				navigation.dispatch(DrawerActions.openDrawer());
				return true;
			}
			return false;
		};
		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
		return () => {
			backHandler.remove();
		};
	}, [drawerStatus, navigation]);

	const fetchMemberChannel = useCallback(async () => {
		if (!currentChannel) {
			return;
		}
		await dispatch(
			channelMembersActions.fetchChannelMembers({
				clanId: currentChannel?.clan_id || '',
				channelId: currentChannel?.channel_id || '',
				channelType: currentChannel?.type
			})
		);
	}, [currentChannel, dispatch]);

	useFocusEffect(
		useCallback(() => {
			setIsFocusChannelView(true);
			if (prevChannelIdRef.current !== currentChannel?.channel_id) {
				fetchMemberChannel();
			}
			prevChannelIdRef.current = currentChannel?.channel_id;
			return () => {
				setIsFocusChannelView(false);
			};
		}, [currentChannel?.channel_id])
	);

	useEffect(() => {
		const timeout = setTimeout(() => {
			checkShowLicenseAgreement();
		}, 500);
		return () => {
			timeoutRef?.current && clearTimeout(timeoutRef.current);
			clearTimeout(timeout);
		};
	}, []);

	const checkShowLicenseAgreement = async () => {
		const isAgreed = await load(STORAGE_AGREED_POLICY);

		setIsShowLicenseAgreement(Platform.OS === 'ios' && isAgreed?.toString() !== 'true');
	};

	return (
		<View style={[styles.homeDefault]}>
			<LicenseAgreement
				show={isShowLicenseAgreement}
				onClose={() => {
					setIsShowLicenseAgreement(false);
					save(STORAGE_AGREED_POLICY, 'true');
				}}
			/>
			<HomeDefaultHeader
				openBottomSheet={openBottomSheet}
				navigation={props.navigation}
				currentChannel={currentChannel}
				onOpenDrawer={onOpenDrawer}
				parentChannelLabel={parent?.channel_label || ''}
			/>
			{currentChannel && isFocusChannelView && !isChannelApp && (
				<View style={styles.channelView}>
					<ChannelMessagesWrapper
						channelId={currentChannel?.channel_id}
						clanId={currentChannel?.clan_id}
						isPublic={isPublicChannel(currentChannel)}
						mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
					/>
					<ChatBox
						channelId={currentChannel?.channel_id}
						mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
						onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
					/>
					<PanelKeyboard ref={panelKeyboardRef} currentChannelId={currentChannel.channel_id} currentClanId={currentChannel?.clan_id} />
				</View>
			)}

			<MezonBottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
				<NotificationSetting />
			</MezonBottomSheet>
		</View>
	);
});

const HomeDefaultHeader = React.memo(
	({
		navigation,
		currentChannel,
		openBottomSheet,
		onOpenDrawer,
		parentChannelLabel
	}: {
		navigation: any;
		currentChannel: ChannelsEntity;
		openBottomSheet: () => void;
		onOpenDrawer: () => void;
		parentChannelLabel: string;
	}) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const navigateMenuThreadDetail = () => {
			navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET });
		};
		const { statusMute } = useStatusMuteChannel();
		const isTabletLandscape = useTabletLandscape();

		const navigateToSearchPage = () => {
			navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
				screen: APP_SCREEN.MENU_CHANNEL.SEARCH_MESSAGE_CHANNEL,
				params: {
					openSearchChannelFrom: EOpenSearchChannelFrom.HeaderDefault,
					currentChannel
				}
			});
		};

		const renderChannelIcon = () => {
			if (currentChannel?.channel_private === ChannelStatusEnum.isPrivate && !!Number(currentChannel?.parrent_id)) {
				return <Icons.ThreadLockIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (!!currentChannel?.channel_label && !!Number(currentChannel?.parrent_id)) {
				return <Icons.ThreadIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (currentChannel?.channel_private === ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT) {
				return <Icons.TextLockIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (currentChannel?.channel_private !== ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING) {
				return <Icons.StreamIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			if (currentChannel?.channel_private !== ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_APP) {
				return <Icons.AppChannelIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
			}

			return <Icons.TextIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />;
		};

		return (
			<View style={styles.homeDefaultHeader}>
				<TouchableOpacity style={{ flex: 1 }} onPress={navigateMenuThreadDetail}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{!isTabletLandscape && (
							<TouchableOpacity activeOpacity={0.8} style={styles.iconBar} onPress={onOpenDrawer}>
								<Icons.ArrowLargeLeftIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />
							</TouchableOpacity>
						)}
						{!!currentChannel?.channel_label && (
							<View style={styles.channelContainer}>
								{renderChannelIcon()}
								<View>
									<View style={styles.threadHeaderBox}>
										<Text style={styles.threadHeaderLabel} numberOfLines={1}>
											{currentChannel?.channel_label}
										</Text>
									</View>
									{!!parentChannelLabel && (
										<Text style={styles.channelHeaderLabel} numberOfLines={1}>
											{parentChannelLabel}
										</Text>
									)}
								</View>
							</View>
						)}
					</View>
				</TouchableOpacity>
				{!!currentChannel?.channel_label && !!Number(currentChannel?.parrent_id) ? (
					<TouchableOpacity style={styles.iconBell} onPress={() => openBottomSheet()}>
						{statusMute === ENotificationActive.OFF ? (
							<Icons.BellSlashIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />
						) : (
							<Icons.BellIcon width={size.s_20} height={size.s_20} color={themeValue.textStrong} />
						)}
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={styles.iconBell} onPress={() => navigateToSearchPage()}>
						<Icons.MagnifyingIcon width={size.s_20} height={size.s_20} color={Colors.textGray} />
					</TouchableOpacity>
				)}
			</View>
		);
	}
);

export default HomeDefault;
