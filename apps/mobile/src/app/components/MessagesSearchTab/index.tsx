import { useSearchMessages } from '@mezon/core';
import { GroupedMessages } from '@mezon/mobile-components';
import { Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { MessagesEntity, SearchMessageEntity } from '@mezon/store';
import { SIZE_PAGE_SEARCH } from '@mezon/utils';
import { FlashList } from '@shopify/flash-list';
import { ChannelStreamMode } from 'mezon-js';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, Text, View } from 'react-native';
import MessageItem from '../../screens/home/homedrawer/MessageItem';
import EmptySearchPage from '../EmptySearchPage';
import { SearchMessageChannelContext } from '../ThreadDetail/SearchMessageChannel';
import style from './MessagesSearchTab.styles';

const MessagesSearchTab = React.memo(({ messageSearchByChannelId }: { messageSearchByChannelId: SearchMessageEntity[] }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const filtersSearch = useContext(SearchMessageChannelContext);
	const { totalResult, fetchSearchMessages } = useSearchMessages();
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (messageSearchByChannelId?.length > 0) {
			setMessages((prevMessages) => {
				const existingMessages = new Set(prevMessages.map((msg) => msg?.id));
				const newMessages = messageSearchByChannelId?.filter((msg) => !existingMessages.has(msg.id));
				if (newMessages.length > 0) {
					return [...prevMessages, ...newMessages];
				}
				return prevMessages;
			});
		} else {
			setMessages([]);
		}
	}, [messageSearchByChannelId]);

	const ViewLoadMore = () => {
		return (
			<View style={styles.loadMoreChannelMessage}>
				<ActivityIndicator size="large" color={Colors.tertiary} />
			</View>
		);
	};

	const searchMessages = useMemo(() => {
		const groupedMessages: GroupedMessages = [];
		let currentGroup: SearchMessageEntity[] = [];
		let currentLabel: string | null | undefined = null;

		messages?.forEach((message) => {
			const label = message?.channel_label ?? '';
			if (label !== currentLabel) {
				if (currentGroup?.length > 0) {
					groupedMessages.push({ label: currentLabel, messages: currentGroup });
					currentGroup = [];
				}
				currentLabel = label;
			}
			currentGroup?.push(message);
		});

		if (currentGroup.length > 0) {
			groupedMessages?.push({ label: currentLabel, messages: currentGroup });
		}

		return groupedMessages;
	}, [messages, messageSearchByChannelId]);

	const loadMoreMessages = async () => {
		if (isLoadingMore || totalResult === messages?.length) return;
		setIsLoadingMore(true);
		const payload = {
			filters: filtersSearch,
			from: currentPage,
			size: SIZE_PAGE_SEARCH
		};

		try {
			await fetchSearchMessages(payload);
			setCurrentPage((prevPage) => prevPage + 1);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoadingMore(false);
		}
	};

	const renderMessageItem = (message: MessagesEntity, index: number) => (
		<Block key={`${message?.id}_${index}`} marginVertical={size.s_10}>
			<MessageItem message={message} messageId={message.id} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} preventAction />
		</Block>
	);

	const renderGroupItem = ({ item }) => (
		<Block>
			{!!item?.label && <Text style={styles.groupMessageLabel}>{`# ${item?.label}`}</Text>}
			{item?.messages?.map(renderMessageItem)}
		</Block>
	);

	return (
		<Block style={styles.container}>
			{searchMessages?.length ? (
				<Block height={'100%'} width={'100%'} paddingBottom={size.s_100}>
					<FlashList
						showsVerticalScrollIndicator={false}
						data={searchMessages}
						keyboardShouldPersistTaps={'handled'}
						onScrollBeginDrag={Keyboard.dismiss}
						renderItem={renderGroupItem}
						estimatedItemSize={100}
						removeClippedSubviews={true}
						onEndReached={loadMoreMessages}
						onEndReachedThreshold={0.5}
						ListFooterComponent={isLoadingMore && <ViewLoadMore />}
					/>
				</Block>
			) : (
				<EmptySearchPage />
			)}
		</Block>
	);
});

export default MessagesSearchTab;
