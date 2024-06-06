import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Image, Platform, DeviceEventEmitter } from 'react-native';
import { styles } from './styles';
import { Colors } from '@mezon/mobile-ui';
import { ActionEmitEvent, ArrowLeftIcon, ChevronIcon, UserGroupIcon } from '@mezon/mobile-components';
import { useMemberStatus } from '@mezon/core';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { ChannelStreamMode } from 'mezon-js';
import ChatBox from '../../home/homedrawer/ChatBox';
import { useSelector } from 'react-redux';
import { directActions, getStoreAsync, selectDmGroupCurrent } from '@mezon/store-mobile';
import { IModeKeyboardPicker } from '../../home/homedrawer/components';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomKeyboardPicker from '../../home/homedrawer/components/BottomKeyboardPicker';
import EmojiPicker from '../../home/homedrawer/components/EmojiPicker';
import AttachmentPicker from '../../home/homedrawer/components/AttachmentPicker';
import ChannelMessages from '../../home/homedrawer/ChannelMessages';
import { useCallback } from 'react';

export const DirectMessageDetailScreen = ({navigation, route}: {navigation: any, route: any}) => {
    const directMessageId = route.params?.directMessageId as string;
    const from = route.params?.from;
    const [heightKeyboardShow, setHeightKeyboardShow] = useState<number>(0);
	const [typeKeyboardBottomSheet, setTypeKeyboardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const bottomPickerRef = useRef<BottomSheet>(null);
    const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageId ?? ''));

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
    }

    const directMessageLoader = useCallback(async () => {
        const store = await getStoreAsync();
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
        if (currentDmGroup?.id) {
            directMessageLoader()
        }
    }, [currentDmGroup, directMessageLoader])

    const handleBack = () => {
        if (APP_SCREEN.MESSAGES.NEW_GROUP === from) {
            navigation.navigate(APP_SCREEN.MESSAGES.HOME)
            return;
        }
        navigation.goBack()
    }
    return (
        <View style={styles.dmMessageContainer}>
            <View style={styles.headerWrapper}>
                <Pressable onPress={() => handleBack()}>
                    <ArrowLeftIcon color={Colors.textGray} />
                </Pressable>
                <Pressable style={styles.channelTitle} onPress={() => navigateToThreadDetail()}>
                    {currentDmGroup?.channel_avatar?.length > 1 ? (
                        <View style={styles.groupAvatar}>
                            <UserGroupIcon width={15} height={15} />
                        </View>
                    ): (
                        <View>
                            <Image source={{ uri: currentDmGroup?.channel_avatar[0] || '' }} style={styles.friendAvatar} />
                            <View style={[styles.statusCircle, userStatus ? styles.online : styles.offline]} />
                        </View>
                    )}
                    <Text style={styles.titleText} numberOfLines={1}>{currentDmGroup?.channel_label}</Text>
                    <ChevronIcon width={10} height={10} />
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
                                <AttachmentPicker currentChannelId={currentDmGroup?.channel_id} currentClanId={currentDmGroup?.clan_id} />
                            ) : (
                                <View />
                            )}
                        </BottomKeyboardPicker>
					)}
				</View>
			): null}
           
        </View>

        
    )
}