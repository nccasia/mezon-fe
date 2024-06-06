import { useNavigation } from '@react-navigation/native';

import { MuteIcon, SearchIcon, SettingIcon, ThreadIcon, UnMuteIcon } from '@mezon/mobile-components';
import { Pressable, Text, View } from 'react-native';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import styles from './style';
import { useSelector } from 'react-redux';
import { selectnotificatonSelected } from '@mezon/store-mobile';

const enum EActionMute {
  Mute = 1,
  UnMute = 0
}

export default function ActionRow() {
  const getNotificationChannelSelected = useSelector(selectnotificatonSelected);
	const navigation = useNavigation<any>();
  const actionList = [
		{
			title: 'Search',
			action: () => {},
			icon: <SearchIcon width={22} height={22} />,
		},
		{
			title: 'Threads',
			action: () => {
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD });
			},
			icon: <ThreadIcon width={22} height={22} />,
		},
		{
			title: 'Mute',
			action: () => {
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL });
      },
			icon: getNotificationChannelSelected?.active === EActionMute.Mute ?
      <UnMuteIcon width={22} height={22} /> : <MuteIcon width={22} height={22} />,
		},
		{
			title: 'Settings',
			action: () => {},
			icon: <SettingIcon width={22} height={22} />,
		},
	];
	return (
		<View style={styles.container}>
			{actionList.map((action, index) => (
				<Pressable key={index.toString()} onPress={action.action}>
					<View style={styles.iconBtn}>
						<View style={styles.iconWrapper}>{action.icon}</View>
						<Text style={styles.optionText}>{action.title}</Text>
					</View>
				</Pressable>
			))}
		</View>
	);
}
