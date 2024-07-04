import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import {
	ActionEmitEvent,
} from '@mezon/mobile-components';
import { Block, Colors, useTheme } from '@mezon/mobile-ui';
import {
	channelMembersActions,
	selectCurrentChannel,
	useAppDispatch,
} from '@mezon/store-mobile';
import { IMessageWithUser } from '@mezon/utils';
import { useFocusEffect } from '@react-navigation/native';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, Keyboard, Platform, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import NotificationSetting from '../../../../../components/NotificationSetting';
import ChannelMessages from '../../ChannelMessages';
import ChatBox from '../../ChatBox';
import AttachmentPicker from '../AttachmentPicker';
import BottomKeyboardPicker, { IModeKeyboardPicker } from '../BottomKeyboardPicker';
import EmojiPicker from '../EmojiPicker';
import ForwardMessageModal from '../ForwardMessage';
import HomeDefaultHeader from './HomeDeafultHeader';
import { style } from './styles';

const HomeDefault = React.memo((props: any) => {
	const styles = style(useTheme().themeValue);
	const currentChannel = useSelector(selectCurrentChannel);
	const [heightKeyboardShow, setHeightKeyboardShow] = useState<number>(0);
	const [typeKeyboardBottomSheet, setTypeKeyboardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const bottomPickerRef = useRef<BottomSheet>(null);
	const [showForwardModal, setShowForwardModal] = useState(false);
	const [isFocusChannelView, setIsFocusChannelView] = useState(false);
	const [messageForward, setMessageForward] = useState<IMessageWithUser>(null);
	const dispatch = useAppDispatch();

	const prevChannelIdRef = useRef<string>();

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
			if (prevChannelIdRef.current !== currentChannel?.channel_id) {
				fetchMemberChannel();
			}
			prevChannelIdRef.current = currentChannel?.channel_id;
			return () => {
				setIsFocusChannelView(false);
			};
		}, [currentChannel?.channel_id]),
	);

	const fetchMemberChannel = async () => {
		if (!currentChannel) {
			return;
		}
		await dispatch(
			channelMembersActions.fetchChannelMembers({
				clanId: currentChannel?.clan_id || '',
				channelId: currentChannel?.channel_id || '',
				channelType: currentChannel?.type,
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
								<AttachmentPicker currentChannelId={currentChannel.channel_id} currentClanId={currentChannel?.clan_id} />
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
			{showForwardModal && (
				<View style={{ flex: 1 }}>
					<ForwardMessageModal show={showForwardModal} onClose={() => setShowForwardModal(false)} message={messageForward} />
				</View>
			)}
		</View>
	);
});

export default HomeDefault;
