import React, { useRef, useState } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { BarsIcon, HashSignIcon, SearchIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChannelMessages from './ChannelMessages';
import ChatBox from './ChatBox';
import AttachmentPicker from './components/AttachmentPicker';
import BottomKeyboardPicker, { IKeyboardType } from './components/BottomKeyboardPicker';
import EmojiPicker from './components/EmojiPicker';
import { styles } from './styles';
import { useAnimatedKeyboard } from 'react-native-reanimated';

const HomeDefault = React.memo((props: any) => {
	const currentChannel = useSelector(selectCurrentChannel);

	const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
	const [keyboardType, setKeyboardType] = useState<IKeyboardType>('text');
	const bottomKeyboardRef = useRef<BottomSheet>(null);

	const onShowKeyboardBottomSheet = (isShow: boolean, height: number, type?: IKeyboardType) => {
		setKeyboardHeight(height);
		if (isShow) {
			setKeyboardType(type);
			bottomKeyboardRef && bottomKeyboardRef.current && bottomKeyboardRef.current.collapse();
		} else {
			setKeyboardType('text');
			bottomKeyboardRef && bottomKeyboardRef.current && bottomKeyboardRef.current.close();
		}
	};

	function handleSelected() {
		onShowKeyboardBottomSheet(false, 0, "text");
	}

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
						onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
					/>

					<View style={{ height: keyboardHeight }} />

					<BottomKeyboardPicker height={keyboardHeight} ref={bottomKeyboardRef}>
						{keyboardType === 'emoji' ? (
							<EmojiPicker onDone={handleSelected} />
						) : keyboardType === 'attachment' ? (
							<AttachmentPicker />
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
			<SearchIcon width={22} height={22} style={{ marginRight: 20 }} />
		</View>
	);
});

export default HomeDefault;
