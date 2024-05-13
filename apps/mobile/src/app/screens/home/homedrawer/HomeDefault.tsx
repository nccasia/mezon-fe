import { Colors } from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store';
import { ChannelStreamMode } from 'mezon-js';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import BarsLogo from '../../../../assets/svg/bars-white.svg';
import HashSignIcon from '../../../../assets/svg/channelText-white.svg';
import SearchLogo from '../../../../assets/svg/discoverySearch-white.svg';
import ChannelMessages from './ChannelMessages';
import ChatBox from './ChatBox';
import { styles } from './styles';

const HomeDefault = React.memo((props: any) => {
	const currentChannel = useSelector(selectCurrentChannel);

	return (
		<View style={[styles.homeDefault]}>
			<HomeDefaultHeader navigation={props.navigation} channelTitle={currentChannel?.channel_label} />

			<View style={{ flex: 1, backgroundColor: Colors.tertiaryWeight }}>
				{currentChannel && (
					<ChannelMessages channelId={currentChannel.channel_id} type="CHANNEL" mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />
				)}
			</View>
			<ChatBox channelTitle={currentChannel?.channel_label || ''} channelId={3} serverId={1} />
		</View>
	);
});

const HomeDefaultHeader = React.memo(({ navigation, channelTitle }: { navigation: any; channelTitle: string }) => {
	return (
		<View style={styles.homeDefaultHeader}>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<TouchableOpacity activeOpacity={0.8} style={styles.iconBar} onPress={() => navigation.openDrawer()}>
					<BarsLogo width={20} height={20} />
				</TouchableOpacity>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{!!channelTitle && <HashSignIcon width={18} height={18} />}
					<Text style={{ color: '#FFFFFF', fontFamily: 'bold', marginLeft: 10, fontSize: 16 }}>{channelTitle}</Text>
				</View>
			</View>
			<SearchLogo width={22} height={22} style={{ marginRight: 20 }} />
		</View>
	);
});

export default HomeDefault;
