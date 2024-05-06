import { IChannel } from '@mezon/utils';
import React from 'react';
import { Text, View } from 'react-native';
import LongCornerIcon from '../../../../assets/svg/long-corner.svg';
import ShortCornerIcon from '../../../../assets/svg/short-corner.svg';
import { styles } from './styles';

type ThreadListChannelProps = {
	threads: IChannel[];
};

const ThreadListChannel = React.memo(({ threads }: ThreadListChannelProps) => {
	return (
		<View style={styles.containerThreadList}>
			{threads.map((thread) => {
				const isFirstThread = threads.indexOf(thread) === 0;
				return (
					<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
						{isFirstThread ? <ShortCornerIcon /> : <LongCornerIcon />}
						<Text style={styles.titleThread}>{thread?.channel_label}</Text>
					</View>
				);
			})}
		</View>
	);
});

export default ThreadListChannel;
