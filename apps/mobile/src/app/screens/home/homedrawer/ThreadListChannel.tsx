import { ChannelsEntity } from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import LongCornerIcon from '../../../../assets/svg/long-corner.svg';
import ShortCornerIcon from '../../../../assets/svg/short-corner.svg';
import { styles } from './styles';

type ThreadListChannelProps = {
	threads: IChannel[];
	currentChanel: ChannelsEntity;
	onPress: (thread: IChannel) => void;
};

const ThreadListChannel = React.memo(({ threads, currentChanel, onPress }: ThreadListChannelProps) => {
	return (
		<View style={styles.containerThreadList}>
			{threads.map((thread) => {
				const isFirstThread = threads.indexOf(thread) === 0;
				const isActive = currentChanel?.channel_id === thread.channel_id;

				return (
					<TouchableOpacity
						key={thread.id}
						activeOpacity={1}
						onPress={() => {
							onPress(thread);
						}}
						style={[styles.threadItem]}
					>
						{isActive && <View style={[styles.threadItemActive, isFirstThread && styles.threadFirstItemActive]} />}
						{isFirstThread ? <ShortCornerIcon /> : <LongCornerIcon />}
						<Text style={styles.titleThread}>{thread?.channel_label}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
});

export default ThreadListChannel;
