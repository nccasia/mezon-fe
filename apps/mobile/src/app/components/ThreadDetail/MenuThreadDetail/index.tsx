import { DirectEntity, selectCurrentChannel } from '@mezon/store-mobile';
import React, { createContext, useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { style } from './style';

import { useTheme } from '@mezon/mobile-ui';
import { IChannel } from '@mezon/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionRow } from '../ActionRow';
import { AssetsViewer } from '../AssetViewer';
import { ThreadHeader } from '../ThreadHeader';

export const threadDetailContext = createContext<IChannel | DirectEntity>(null);

export default function MenuThreadDetail(props: { route: any }) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	//NOTE: from DirectMessageDetail component
	const directMessage = props.route?.params?.directMessage as DirectEntity;
	const currentChannel = useSelector(selectCurrentChannel);
	const channel = useMemo(() => {
		if (directMessage?.id) {
			return directMessage;
		}
		return currentChannel;
	}, [directMessage, currentChannel]);

	return (
		<threadDetailContext.Provider value={channel}>
			<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: themeValue.secondary }}>
				<View style={styles.container}>
					<ThreadHeader />
					<ActionRow />
					<AssetsViewer channelId={channel?.channel_id} />
				</View>
			</SafeAreaView>
		</threadDetailContext.Provider>
	);
}
