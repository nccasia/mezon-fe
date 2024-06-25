import { useNavigation } from '@react-navigation/native';

import { MuteIcon, SearchIcon, SettingIcon, ThreadIcon, UnMuteIcon } from '@mezon/mobile-components';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import useStatusMuteChannel, { EActionMute } from '../../../hooks/useStatusMuteChannel';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import styles from './style';
import { EOpenThreadDetailFrom } from '../../../screens/home/homedrawer/HomeDefault';

export default function ActionRow() {
	const currentChannel = useSelector(selectCurrentChannel);
	const navigation = useNavigation<any>();
	const { statusMute } = useStatusMuteChannel();
	const [isChannel, setIsChannel] = useState<boolean>();
	useEffect(() => {
		setIsChannel(!!currentChannel?.channel_label && !Number(currentChannel?.parrent_id));
	}, [currentChannel]);
	const actionList = [
		{
			title: 'Search',
			action: () => {
			navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET ,
        params: { openThreadDetailFrom: EOpenThreadDetailFrom.SearchChannel } });
      },
			icon: <SearchIcon width={22} height={22} />,
			hidden: true,
		},
		{
			title: 'Threads',
			action: () => {
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD });
			},
			icon: <ThreadIcon width={22} height={22} />,
			hidden: isChannel,
		},
		{
			title: 'Mute',
			action: () => {
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL });
			},
			icon: statusMute === EActionMute.Mute ? <MuteIcon width={22} height={22} /> : <UnMuteIcon width={22} height={22} />,
			hidden: true,
		},
		{
			title: 'Settings',
			action: () => {},
			icon: <SettingIcon width={22} height={22} />,
			hidden: true,
		},
	];
	return (
		<View style={styles.container}>
			{actionList.map((action, index) =>
				action?.hidden ? (
					<Pressable key={index.toString()} onPress={action.action}>
						<View style={styles.iconBtn}>
							<View style={styles.iconWrapper}>{action.icon}</View>
							<Text style={styles.optionText}>{action.title}</Text>
						</View>
					</Pressable>
				) : null,
			)}
		</View>
	);
}
