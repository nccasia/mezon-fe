import { useChatMessages } from '@mezon/core';
import { Colors } from '@mezon/mobile-ui';
import moment from 'moment';
import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import MessageItem from './MessageItem';
import { styles } from './styles';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

const ChannelMessages = React.memo(({ channelId, channelLabel, type, mode }: ChannelMessagesProps) => {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
	const sortedMessages = messages.sort((a, b) => moment(b.create_time).valueOf() - moment(a.create_time).valueOf());
	const onLoadMore = () => {
		if (hasMoreMessage) {
			setIsLoadMore(true);
			loadMoreMessage().finally(() => setIsLoadMore(false));
		}
	};

	const ViewLoadMore = () => {
		return (
			<View style={styles.loadMoreChannelMessage}>
				<ActivityIndicator size="large" color={Colors.tertiary} />
			</View>
		);
	};

	return (
		<FlatList
			inverted
			data={sortedMessages}
			contentContainerStyle={styles.listChannels}
			renderItem={({ item, index }) => {
				return (
					<MessageItem
						message={item}
						mode={mode}
						preMessage={sortedMessages.length > 0 ? sortedMessages?.[index - 1] : undefined}
					/>
				)
			}}
			keyExtractor={(item) => `${item?.id}`}
			windowSize={10}
			removeClippedSubviews={true}
			maxToRenderPerBatch={20}
			updateCellsBatchingPeriod={50}
			onEndReached={onLoadMore}
			onEndReachedThreshold={0.5}
			ListFooterComponent={isLoadMore ? <ViewLoadMore /> : null}
		/>
	);
});

export default ChannelMessages;
