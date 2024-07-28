import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';

import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { EActionMute } from '../../../hooks/useStatusMuteChannel';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { threadDetailContext } from '../MenuThreadDetail';
import { style } from './style';
import { useSelector } from 'react-redux';
import { selectnotificatonSelected } from '@mezon/store-mobile';
enum EActionRow {
  Search,
  Threads,
  Mute,
  Settings
}

export const ActionRow = React.memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChannel = useContext(threadDetailContext);
	const navigation = useNavigation<any>();
	const getNotificationChannelSelected = useSelector(selectnotificatonSelected);
	const [isChannel, setIsChannel] = useState<boolean>();
	useEffect(() => {
		setIsChannel(!!currentChannel?.channel_label && !Number(currentChannel?.parrent_id));
	}, [currentChannel]);
	const actionList = [
		{
			title: 'Search',
			action: () => { },
			icon: <Icons.MagnifyingIcon width={22} height={22} color={themeValue.text} />,
			hidden: true,
      type: EActionRow.Search
		},
		{
			title: 'Threads',
			action: () => {
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD });
			},
			icon: <Icons.ThreadIcon width={22} height={22} color={themeValue.text} />,
			hidden: isChannel,
      type: EActionRow.Threads
		},
		{
			title: 'Mute',
			action: () => {
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL, params: { currentChannel } });
			},
			hidden: true,
      type: EActionRow.Mute
		},
		{
			title: 'Settings',
			action: () => {
				navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
					screen: APP_SCREEN.MENU_CHANNEL.SETTINGS,
					params: {
						channelId: currentChannel?.channel_id,
					},
				});
			},
			icon: <Icons.SettingsIcon width={22} height={22} color={themeValue.text} />,
			hidden: true,
      type: EActionRow.Settings
		},
	];

	const filteredActionList = useMemo(() => {
		if (currentChannel?.clan_id === '0') {
			return actionList.filter((item) => ['Mute', 'Search'].includes(item.title));
		}
		return actionList;
	}, [currentChannel, isChannel]);
	return (
		<View style={styles.container}>
			{filteredActionList.map((action, index) =>
				action?.hidden ? (
					<Pressable key={index.toString()} onPress={action.action}>
						<View style={styles.iconBtn}>
							<View style={styles.iconWrapper}>{[EActionRow.Mute].includes(action.type) ? (
                getNotificationChannelSelected?.active === EActionMute.Mute
                ? <Icons.BellIcon width={22} height={22} color={themeValue.text} />
                : <Icons.BellSlashIcon width={22} height={22} color={themeValue.text} />
              ) : action.icon}</View>
							<Text style={styles.optionText}>{action.title}</Text>
						</View>
					</Pressable>
				) : null,
			)}
		</View>
	);
});
