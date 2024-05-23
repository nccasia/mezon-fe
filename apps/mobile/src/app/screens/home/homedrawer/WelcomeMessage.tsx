import React from 'react';
import { Text, View } from 'react-native';

import { FastImageRes } from './Reusables';
import { styles } from './styles';
import { HashSignIcon } from '@mezon/mobile-components';

const WelcomeMessage = React.memo((props: { channelTitle: string; uri?: string }) => {
	return (
		<View style={styles.wrapperWelcomeMessage}>
			<View style={styles.iconWelcomeMessage}>
				{props.uri ? (
					<View style={{ width: 50, height: 50 }}>
						<FastImageRes uri={props.uri} />
					</View>
				) : (
					<HashSignIcon width={50} height={50} />
				)}
			</View>
			{!!props.channelTitle && (
				<View style={{}}>
					<Text style={styles.titleWelcomeMessage}>{'Welcome to #' + props.channelTitle}</Text>
					<Text style={styles.subTitleWelcomeMessage}>{'This is the start of the #' + props.channelTitle}</Text>
				</View>
			)}
		</View>
	);
});

export default WelcomeMessage;
