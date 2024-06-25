import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import {
	ActionEmitEvent,
	AngleRight,
	HashSignLockIcon,
	MuteIcon,
	SearchIcon,
	ThreadIcon,
	UnMuteIcon,
	getChannelById,
} from '@mezon/mobile-components';
import { Block, Colors, size } from '@mezon/mobile-ui';
import {
	ChannelsEntity,
	channelMembersActions,
	directActions,
	selectChannelsEntities,
	selectCurrentChannel,
	selectDmGroupCurrentId,
	useAppDispatch,
} from '@mezon/store-mobile';
import { ChannelStatusEnum, IMessageWithUser } from '@mezon/utils';
import { useFocusEffect } from '@react-navigation/native';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import BarsLogo from '../../../../assets/svg/bars-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText-white.svg';
import NotificationSetting from '../../../components/NotificationSetting';
import useStatusMuteChannel, { EActionMute } from '../../../hooks/useStatusMuteChannel';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessages from './ChannelMessages';
import ChatBox from './ChatBox';
import AttachmentPicker from './components/AttachmentPicker';
import BottomKeyboardPicker, { IModeKeyboardPicker } from './components/BottomKeyboardPicker';
import EmojiPicker from './components/EmojiPicker';
import ForwardMessageModal from './components/ForwardMessage';
import { styles } from './styles';

const HomeDefault = React.memo((props: any) => {
	const currentChannel = useSelector(selectCurrentChannel);
	const [heightKeyboardShow, setHeightKeyboardShow] = useState<number>(0);
	const [typeKeyboardBottomSheet, setTypeKeyboardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const bottomPickerRef = useRef<BottomSheet>(null);
	const [showForwardModal, setShowForwardModal] = useState(false);
	const [isFocusChannelView, setIsFocusChannelView] = useState(false);
	const [messageForward, setMessageForward] = useState<IMessageWithUser>(null);
	const dispatch = useAppDispatch();

	const currentDmGroupId = useSelector(selectDmGroupCurrentId);
	const prevChannelRef = useRef<ChannelsEntity>();
	const currentDmGroupIdRef = useRef<string>();

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

	useEffect(() => {
		const showKeyboard = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_FORWARD_MODAL, (payload) => {
			setMessageForward(payload.targetMessage);
			setShowForwardModal(true);
		});
		return () => {
			showKeyboard.remove();
		};
	}, []);

	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ['15%', '40%'], []);
	const [isShowSettingNotifyBottomSheet, setIsShowSettingNotifyBottomSheet] = useState<boolean>(false);

	const openBottomSheet = () => {
		Keyboard.dismiss();
		bottomSheetRef.current?.snapToIndex(1);
		setIsShowSettingNotifyBottomSheet(!isShowSettingNotifyBottomSheet);
	};

	const closeBottomSheet = () => {
		bottomSheetRef.current?.close();
		setIsShowSettingNotifyBottomSheet(false);
	};
	const renderBackdrop = useCallback((props) => <BottomSheetBackdrop {...props} opacity={0.5} onPress={closeBottomSheet} appearsOnIndex={1} />, []);

	useFocusEffect(
		useCallback(() => {
			setIsFocusChannelView(true);
			if (prevChannelRef.current !== currentChannel || (currentDmGroupIdRef.current !== currentDmGroupId && currentDmGroupId)) {
				fetchMemberChannel();
			}
			prevChannelRef.current = currentChannel;
			currentDmGroupIdRef.current = currentDmGroupId;
			return () => {
				setIsFocusChannelView(false);
				currentDmGroupIdRef.current = null;
			};
		}, [currentChannel, currentDmGroupId]),
	);

	const fetchMemberChannel = async () => {
		if (currentDmGroupId) {
			dispatch(directActions.setDmGroupCurrentId(''));
		}

		await dispatch(
			channelMembersActions.fetchChannelMembers({
				clanId: currentChannel.clan_id || '',
				channelId: currentChannel.channel_id || '',
				channelType: currentChannel.type,
			}),
		);
	};

	const onOpenDrawer = () => {
		onShowKeyboardBottomSheet(false, 0, 'text');
		props.navigation.openDrawer();
		Keyboard.dismiss();
	};

	return (
		<View style={[styles.homeDefault]}>
			<HomeDefaultHeader
				openBottomSheet={openBottomSheet}
				navigation={props.navigation}
				currentChannel={currentChannel}
				onOpenDrawer={onOpenDrawer}
			/>
			{currentChannel && isFocusChannelView && (
				<View style={{ flex: 1, backgroundColor: Colors.tertiaryWeight }}>
					<ChannelMessages
						channelId={currentChannel.channel_id}
						type="CHANNEL"
						channelLabel={currentChannel?.channel_label}
						mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
					/>
					{heightKeyboardShow !== 0 && typeKeyboardBottomSheet !== 'text' && (
						<Block position={'absolute'} flex={1} height={'100%'} width={'100%'}>
							<TouchableOpacity
								style={{ flex: 1 }}
								onPress={() => onShowKeyboardBottomSheet(false, 0, 'text')}
							></TouchableOpacity>
						</Block>
					)}

					<ChatBox
						channelId={currentChannel.channel_id}
						channelLabel={currentChannel?.channel_label || ''}
						mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
						onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
					/>
					<View
						style={{
							height: Platform.OS === 'ios' || typeKeyboardBottomSheet !== 'text' ? heightKeyboardShow : 0,
							backgroundColor: Colors.secondary,
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
								<AttachmentPicker currentChannelId={currentChannel.channel_id} currentClanId={currentChannel.clan_id} />
							) : (
								<View />
							)}
						</BottomKeyboardPicker>
					)}
				</View>
			)}
			<BottomSheet
				ref={bottomSheetRef}
				enablePanDownToClose={true}
				backdropComponent={renderBackdrop}
				index={-1}
				snapPoints={snapPoints}
				backgroundStyle={{ backgroundColor: Colors.secondary }}
			>
				<BottomSheetView>{isShowSettingNotifyBottomSheet && <NotificationSetting />}</BottomSheetView>
			</BottomSheet>
			{showForwardModal && <ForwardMessageModal show={showForwardModal} onClose={() => setShowForwardModal(false)} message={messageForward} />}
		</View>
	);
});

export enum EOpenThreadDetailFrom {
  SearchChannel = "search_channel"
}

const HomeDefaultHeader = React.memo(
	({
		navigation,
		currentChannel,
		openBottomSheet,
		onOpenDrawer,
	}: {
		navigation: any;
		currentChannel: ChannelsEntity;
		openBottomSheet: () => void;
		onOpenDrawer: () => void;
	}) => {
		const navigateMenuThreadDetail = (openThreadDetailFrom?: EOpenThreadDetailFrom) => {
      console.log('openThreadDetailFrom: ', openThreadDetailFrom);

			navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET , params: { openThreadDetailFrom } });
		};
		const channelsEntities = useSelector(selectChannelsEntities);
		const [channelOfThread, setChannelOfThread] = useState<ChannelsEntity>(null);
		const { statusMute } = useStatusMuteChannel();
		const [isThread, setIsThread] = useState<boolean>(false);

		useEffect(() => {
			setChannelOfThread(getChannelById(currentChannel?.parrent_id, channelsEntities));
			setIsThread(!!currentChannel?.channel_label && !!Number(currentChannel?.parrent_id));
		}, [currentChannel, channelsEntities]);
		return (
			<View style={styles.homeDefaultHeader}>
				<TouchableOpacity style={{ flex: 1 }} onPress={()=> navigateMenuThreadDetail()}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<TouchableOpacity activeOpacity={0.8} style={styles.iconBar} onPress={onOpenDrawer}>
							<BarsLogo width={20} height={20} />
						</TouchableOpacity>
						{!!currentChannel?.channel_label && (
							<View style={styles.channelContainer}>
								{isThread ? (
									<ThreadIcon width={20} height={20}></ThreadIcon>
								) : currentChannel?.channel_private === ChannelStatusEnum.isPrivate &&
								  currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT ? (
									<HashSignLockIcon width={20} height={20} color={Colors.white} />
								) : (
									<HashSignIcon width={18} height={18} />
								)}
								<View>
									<View style={styles.threadHeaderBox}>
										<Text style={styles.threadHeaderLabel}>{currentChannel?.channel_label}</Text>
										<AngleRight width={10} height={10} style={{ marginLeft: size.s_4 }} />
									</View>
									{channelOfThread?.channel_label && (
										<Text style={styles.channelHeaderLabel}>{channelOfThread?.channel_label}</Text>
									)}
								</View>
							</View>
						)}
					</View>
				</TouchableOpacity>
				{!!currentChannel?.channel_label && isThread && (
					<TouchableOpacity onPress={() => openBottomSheet()}>
						{statusMute === EActionMute.Mute ? (
							<MuteIcon width={22} height={22} style={{ marginRight: 20 }} />
						) : (
							<UnMuteIcon width={22} height={22} style={{ marginRight: 20 }} />
						)}
					</TouchableOpacity>
				)}
				{!!currentChannel?.channel_label && !isThread && (
					<TouchableOpacity onPress={() => {navigateMenuThreadDetail(EOpenThreadDetailFrom.SearchChannel)
          }}>
						{<SearchIcon width={22} height={22} style={{ marginRight: 20 }} />}
					</TouchableOpacity>
				)}
			</View>
		);
	},
);

export default HomeDefault;
