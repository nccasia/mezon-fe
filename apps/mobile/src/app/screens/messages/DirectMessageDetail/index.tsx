import BottomSheet from '@gorhom/bottom-sheet';
import { useChatMessages, useMemberStatus } from '@mezon/core';
import { ActionEmitEvent, ArrowLeftIcon, UserGroupIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, Image, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessages from '../../home/homedrawer/components/HomeDeafult/ChannelMessage';
import ChatBox from '../../home/homedrawer/components/HomeDeafult/ChatBox';
import { IModeKeyboardPicker } from '../../home/homedrawer/components';
import AttachmentPicker from '../../home/homedrawer/components/AttachmentPicker';
import BottomKeyboardPicker from '../../home/homedrawer/components/BottomKeyboardPicker';
import EmojiPicker from '../../home/homedrawer/components/EmojiPicker';
import { styles } from './styles';
import ForwardMessageModal from "../../home/homedrawer/components/ForwardMessage";
import {IMessageWithUser} from "@mezon/utils";

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
	const directMessageId = route.params?.directMessageId as string;
	const from = route.params?.from;
	const [heightKeyboardShow, setHeightKeyboardShow] = useState<number>(10);
	const [typeKeyboardBottomSheet, setTypeKeyboardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const bottomPickerRef = useRef<BottomSheet>(null);
	const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageId ?? ''));
	const dispatch = useAppDispatch();
	useChannelSeen(directMessageId || '');
	const currentChannel = useSelector(selectCurrentChannel);
	const [showForwardModal, setShowForwardModal] = useState(false);
	const [messageForward, setMessageForward] = useState<IMessageWithUser>(null);
	
	const onShowKeyboardBottomSheet = (isShow: boolean, height: number, type?: IModeKeyboardPicker) => {
		setHeightKeyboardShow(height);
		if (isShow) {
			setTypeKeyboardBottomSheet(type);
			bottomPickerRef && bottomPickerRef.current && bottomPickerRef.current.collapse();
		} else {
			setTypeKeyboardBottomSheet('text');
			bottomPickerRef && bottomPickerRef.current && bottomPickerRef.current.close();
		}
	};
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
			}),
		);
	}, [currentChannel, dispatch]);

	const directMessageLoader = useCallback(async () => {
		const store = await getStoreAsync();
		store.dispatch(clansActions.joinClan({ clanId: currentDmGroup?.clan_id }));
		store.dispatch(
			directActions.joinDirectMessage({
				directMessageId: currentDmGroup.id,
				channelName: currentDmGroup.channel_label,
				type: currentDmGroup.type,
			}),
		);
		return null;
	}, [currentDmGroup]);
	
	useEffect(() => {
		const showKeyboard = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_FORWARD_IN_DM_MODAL, (payload) => {
			setMessageForward(payload.targetMessage);
			setShowForwardModal(true);
		});
		return () => {
			showKeyboard.remove();
		};
	}, []);
	
	useEffect(() => {
		return () => {
			fetchMemberChannel();
		};
	}, [fetchMemberChannel]);

	useEffect(() => {
		if (currentDmGroup?.id) {
			directMessageLoader();
		}
	}, [currentDmGroup, directMessageLoader]);

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
					<ArrowLeftIcon color={Colors.textGray} />
				</Pressable>
				<Pressable style={styles.channelTitle} onPress={() => navigateToThreadDetail()}>
					{currentDmGroup?.channel_avatar?.length > 1 ? (
						<View style={styles.groupAvatar}>
							<UserGroupIcon width={15} height={15} />
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
						type={currentDmGroup?.user_id?.length === 1 ? 'DM' : 'GROUP'}
						channelLabel={currentDmGroup?.channel_label}
						mode={Number(currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)}
					/>
					<ChatBox
						channelId={currentDmGroup?.id}
						channelLabel={currentDmGroup?.channel_label || ''}
						mode={Number(currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)}
						onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
					/>
					<View
						style={{
							height: Platform.OS === 'ios' || typeKeyboardBottomSheet !== 'text' ? heightKeyboardShow : 10,
							backgroundColor: Colors.secondary,
						}}
					/>
					{heightKeyboardShow !== 0 && typeKeyboardBottomSheet !== 'text' && (
						<BottomKeyboardPicker height={heightKeyboardShow} ref={bottomPickerRef} isStickyHeader={typeKeyboardBottomSheet === 'emoji'}>
							{typeKeyboardBottomSheet === 'emoji' ? (
								<EmojiPicker
									directMessageId={directMessageId}
									onDone={() => {
										onShowKeyboardBottomSheet(false, heightKeyboardShow, 'text');
										DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, {});
									}}
									bottomSheetRef={bottomPickerRef}
								/>
							) : typeKeyboardBottomSheet === 'attachment' ? (
								<AttachmentPicker currentChannelId={currentDmGroup?.channel_id} currentClanId={currentDmGroup?.clan_id} />
							) : (
								<View />
							)}
						</BottomKeyboardPicker>
					)}
				</View>
			) : null}
			{showForwardModal && (
				<View style={{flex: 1}}>
					<ForwardMessageModal show={showForwardModal} onClose={() => setShowForwardModal(false)} message={messageForward} />
				</View>
			)}
		</SafeAreaView>
	);
};
