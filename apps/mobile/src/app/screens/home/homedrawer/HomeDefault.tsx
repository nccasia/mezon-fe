import {Colors, Metrics} from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js';
import React, {useCallback, useMemo, useRef} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import BarsLogo from '../../../../assets/svg/bars-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText-white.svg';
import SearchLogo from '../../../../assets/svg/discoverySearch-white.svg';
import ChannelMessages from './ChannelMessages';
import ChatBox from './ChatBox';
import { styles } from './styles';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import BottomSheet, { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import GifStickerEmojiPopup from "./components/GifStickerEmojiPopup";


const HomeDefault = React.memo((props: any) => {
	const currentChannel = useSelector(selectCurrentChannel);
	const bottomSheetModalRef = useRef<any>(null);
	const snapPoints = useMemo(() => [320, Metrics.screenHeight], []);
	
	const onOpenPopup = useCallback(() => {
		bottomSheetModalRef?.current?.present?.();
	}, []);
	
	const onClosePopup = useCallback(() => {
		alert('onClosePopup')
		bottomSheetModalRef.current?.snapToIndex(-1);
		bottomSheetModalRef?.current?.close?.();
	}, []);
	
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
						onShowEmoji={() => {
							bottomSheetModalRef?.current?.present?.();
						}}
					/>
					
					<BottomSheet
						ref={bottomSheetModalRef}
						index={0}
						snapPoints={snapPoints}
						onChange={onOpenPopup}
						onClose={onClosePopup}
					>
						<BottomSheetScrollView>
							<GifStickerEmojiPopup />
						</BottomSheetScrollView>
					</BottomSheet>
				</View>
			)}
		</View>
	);
});

const HomeDefaultHeader = React.memo(({ navigation, channelTitle }: { navigation: any; channelTitle: string }) => {
  const navigateMenuThreadDetail = () => {
    navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET});
  }
	return (
		<View style={styles.homeDefaultHeader}>
      <TouchableOpacity style={ {flex: 1}} onPress={navigateMenuThreadDetail}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<TouchableOpacity activeOpacity={0.8} style={styles.iconBar} onPress={() => {
          navigation.openDrawer()}}>
					<BarsLogo width={20} height={20} />
				</TouchableOpacity>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{!!channelTitle && <HashSignIcon width={18} height={18} />}
					<Text style={{ color: '#FFFFFF', fontFamily: 'bold', marginLeft: 10, fontSize: 16 }}>{channelTitle}</Text>
				</View>
			</View>
      </TouchableOpacity>
			<SearchLogo width={22} height={22} style={{ marginRight: 20 }} />
		</View>
	);
});

export default HomeDefault;
