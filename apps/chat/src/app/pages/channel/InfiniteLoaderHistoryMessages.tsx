import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { ChannelMessage } from './ChannelMessage';
import ChannelMessages from './ChannelMessages';

export default function InfiniteLoaderHistoryMessages({
	hasNextPage,
	isNextPageLoading,
	messages,
	loadNextPage,
}: any) {

	console.log('hasNextPage', hasNextPage);
	console.log('isNextPageLoading', isNextPageLoading);
	console.log('items', messages);
	console.log('loadNextPage', loadNextPage);

	const itemCount = hasNextPage ? messages.length + 1 : messages.length;
	const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

	// Every row is loaded except for our loading indicator row.
	const isItemLoaded = (index: number) => !hasNextPage || index < messages.length;

	// Render an item or a loading indicator.
	const Item = ({ index, style }: any) => {
		let content;
    console.log(content);
		if (!isItemLoaded(index)) {
			content = 'Loading...';
		} else {
			content = messages[index].content;
		}

		return <div style={style}>{content}</div>;
	};

	return (
    <InfiniteLoader
    ref={listRef}
    isItemLoaded={isItemLoaded}
    itemCount={itemCount}
    loadMoreItems={loadMoreItems}
  >
    {({ onItemsRendered, ref }) => (
      <List
        className="List"
        height={150}
        itemCount={itemCount}
        itemSize={30}
        onItemsRendered={onItemsRendered}
        ref={ref}
        width={300}
      >
        {Item}
      </List>
    )}
  </InfiniteLoader>
	);
}
