import { ELoadMoreDirection } from '@mezon/chat-scroll';
import { isEqual } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { MessagesEntity } from '@mezon/store';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { style } from './styles';

interface IChannelListMessageProps {
	flatListRef: React.RefObject<FlatList<MessagesEntity>>;
	messages: MessagesEntity[];
	handleScroll: (event) => void;
	renderItem: ({ item }: { item: MessagesEntity }) => React.ReactElement;
	onLoadMore: (direction: ELoadMoreDirection) => void;
	isLoadMore: boolean;
}

const ChannelListMessage = React.memo(
	({ flatListRef, messages, handleScroll, renderItem, onLoadMore, isLoadMore }: IChannelListMessageProps) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);

		const keyExtractor = useCallback((message) => message.id, []);

		const ViewLoadMore = () => {
			return (
				<View style={styles.loadMoreChannelMessage}>
					<ActivityIndicator size="large" color={Colors.tertiary} />
				</View>
			);
		};

		const isCannotLoadMore = useMemo(() => {
			const lastMessage = messages?.[messages?.length - 1];

			return lastMessage?.sender_id === '0' && !lastMessage?.content?.t && lastMessage?.username === 'system';
		}, [messages]);

		return (
			<FlatList
				ref={flatListRef}
				inverted
				showsVerticalScrollIndicator={false}
				data={messages || []}
				onScroll={handleScroll}
				keyboardShouldPersistTaps={'handled'}
				contentContainerStyle={styles.listChannels}
				renderItem={renderItem}
				removeClippedSubviews={false}
				keyExtractor={keyExtractor}
				windowSize={20}
				initialNumToRender={20}
				onEndReached={
					messages?.length && !isCannotLoadMore
						? () => {
								onLoadMore(ELoadMoreDirection.top);
							}
						: undefined
				}
				onEndReachedThreshold={0.5}
				scrollEventThrottle={60}
				viewabilityConfig={{
					itemVisiblePercentThreshold: 50,
					minimumViewTime: 500
				}}
				// ListHeaderComponent={isLoadMore && hasMoreMessage ? <ViewLoadMore /> : null}
				ListFooterComponent={isLoadMore && !isCannotLoadMore ? <ViewLoadMore /> : null}
			/>
		);
	},
	(prev, curr) => {
		return prev.isLoadMore === curr.isLoadMore && isEqual(prev.messages, curr.messages);
	}
);

export default ChannelListMessage;
