import { ELoadMoreDirection } from '@mezon/chat-scroll';
import { isEqual } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { channelsActions, MessagesEntity, useAppDispatch } from '@mezon/store';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { style } from './styles';

interface IChannelListMessageProps {
  flatListRef: React.RefObject<FlatList<MessagesEntity>>;
  messages: MessagesEntity[];
  handleScroll: (event) => void;
  renderItem: ({ item }: { item: MessagesEntity }) => React.ReactElement;
  onLoadMore: (direction: ELoadMoreDirection) => void;
  isLoadMore: boolean;
  hasMoreMessage: boolean;
}


const ChannelListMessage = React.memo(({
  flatListRef,
  messages,
  handleScroll,
  renderItem,
  onLoadMore,
  isLoadMore,
  hasMoreMessage
}: IChannelListMessageProps) => {
  const { themeValue } = useTheme();
  const styles = style(themeValue);
  
	const keyExtractor = useCallback((message) => message.id, []);

	const dispatch = useAppDispatch();
  if(messages?.[0]?.channel_id ) {
    const timestamp = Date.now() / 1000;
    dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId: messages[0].channel_id, timestamp }));
  }

  const ViewLoadMore = () => {
    return (
      <View style={styles.loadMoreChannelMessage}>
        <ActivityIndicator size="large" color={Colors.tertiary} />
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages || []}
      onScroll={handleScroll}
      keyboardShouldPersistTaps={'handled'}
      contentContainerStyle={styles.listChannels}
      renderItem={renderItem}
      removeClippedSubviews={true}
      keyExtractor={keyExtractor}
      onEndReached={messages?.length ? () => {onLoadMore(ELoadMoreDirection.bottom)} : undefined}
      onEndReachedThreshold={0.1}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={21}
      scrollEventThrottle={60}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 500,
      }}
      ListHeaderComponent={isLoadMore && hasMoreMessage ? <ViewLoadMore /> : null}
      ListFooterComponent={isLoadMore && hasMoreMessage ? <ViewLoadMore /> : null}
  />
  )
}, (prev, curr) => {
   return  (
    prev.hasMoreMessage === curr.hasMoreMessage &&
    prev.isLoadMore === curr.isLoadMore &&
    isEqual(prev.messages, curr.messages)
  )
});


export default ChannelListMessage;