import React, { useRef, useState } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { BarsIcon, HashSignIcon, SearchIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { ChannelStreamMode } from 'mezon-js';
import { Keyboard, KeyboardEvent, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessages from './ChannelMessages';
import ChatBox from './ChatBox';
import AttachmentPicker from './components/AttachmentPicker';
import BottomKeyboardPicker, { IKeyboardType } from './components/BottomKeyboardPicker';
import EmojiPicker from './components/EmojiPicker';
import { styles } from './styles';
import Toast from "react-native-toast-message";
import { useAnimatedKeyboard } from 'react-native-reanimated';
import { useEffect } from 'react';

const HomeDefault = React.memo((props: any) => {
	const currentChannel = useSelector(selectCurrentChannel);

	const [keyboardHeight, setKeyboardHeight] = useState<number>(Platform.OS === 'ios' ? 345 : 274);
	const [isKeyboardShow, setKeyboardShow] = useState<boolean>(false);

	const [keyboardType, setKeyboardType] = useState<IKeyboardType>('text');
	const bottomKeyboardRef = useRef<BottomSheet>(null);

	function handleShowKeyboard(type?: IKeyboardType) {
		setKeyboardShow(true);
		setKeyboardType(type);

		if (type !== "text") {
			Keyboard.dismiss();
			bottomKeyboardRef && bottomKeyboardRef.current && bottomKeyboardRef.current.collapse();
		} else {
			bottomKeyboardRef && bottomKeyboardRef.current && bottomKeyboardRef.current.close();
		}
	};

	function handleHideKeyboard(type?: IKeyboardType) {
		setKeyboardShow(false);
		setKeyboardType("text");

		if (type === "text") {
			Keyboard.dismiss();
		} else {
			bottomKeyboardRef && bottomKeyboardRef.current && bottomKeyboardRef.current.close();
		}
	}

	function handleShowKeyboardText(event: KeyboardEvent) {
		setKeyboardShow(true);

		if (keyboardHeight !== event.endCoordinates.height) {
			setKeyboardHeight(event.endCoordinates.height);
		}
	}

	useEffect(() => {
		const keyboardListener = Keyboard.addListener('keyboardDidShow', handleShowKeyboardText);

		return () => {
			keyboardListener.remove();
		};
	})

	useAnimatedKeyboard();

	return (
		<View style={[styles.homeDefault]}>
			<HomeDefaultHeader navigation={props.navigation} channelTitle={currentChannel?.channel_label} />

			{currentChannel && (
				<View style={{ flex: 1, backgroundColor: Colors.tertiaryWeight }}>
					<ChannelMessages
						channelId={currentChannel.channel_id}
						type="CHANNEL"
						channelLabel={currentChannel?.channel_label}
						mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
					/>

					<ChatBox
						channelId={currentChannel.channel_id}
						channelLabel={currentChannel?.channel_label || ''}
						mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
						onShowKeyboard={handleShowKeyboard}
						onHideKeyboard={handleHideKeyboard}
						keyboardType={keyboardType}
					/>

					<View style={{ height: isKeyboardShow ? keyboardHeight : 0 }} />

					<BottomKeyboardPicker height={keyboardHeight} ref={bottomKeyboardRef}>
						{keyboardType === 'emoji' ? (
							<EmojiPicker
								onDone={() => handleHideKeyboard("emoji")}
								bottomSheetRef={bottomKeyboardRef}
							/>
						) : keyboardType === 'attachment' ? (
							<AttachmentPicker
								currentChannelId={currentChannel.channel_id}
								currentClanId={currentChannel.clan_id}
								onDone={() => handleHideKeyboard("attachment")} />
						) : (
							<View />
						)}
					</BottomKeyboardPicker>
				</View>
			)}
		</View>
	);
});

const HomeDefaultHeader = React.memo(({ navigation, channelTitle }: { navigation: any; channelTitle: string }) => {
	const navigateMenuThreadDetail = () => {
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET });
	};

	return (
		<View style={styles.homeDefaultHeader}>
			<TouchableOpacity style={{ flex: 1 }} onPress={navigateMenuThreadDetail}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<TouchableOpacity
						activeOpacity={0.8}
						style={styles.iconBar}
						onPress={() => {
							navigation.openDrawer();
							Keyboard.dismiss();
						}}
					>
						<BarsIcon width={20} height={20} color={Colors.white} />
					</TouchableOpacity>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{!!channelTitle && <HashSignIcon width={18} height={18} />}
						<Text style={{ color: '#FFFFFF', fontFamily: 'bold', marginLeft: 10, fontSize: 16 }}>{channelTitle}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })}>
				<SearchIcon width={22} height={22} style={{ marginRight: 20 }} />
			</TouchableOpacity>
		</View>
	);
});

export default HomeDefault;
