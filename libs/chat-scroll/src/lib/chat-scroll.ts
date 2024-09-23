import { ILoadMoreCb, IUseReverseInfiniteScrollOptions, useReverseInfiniteScroll } from './reverse-infinite-scroll';
import { IChatScrollData } from './sticky-scroll';

/**
 * React hook for making HTML element scroll behaved like chat.
 * If scroll is at the bottom - it would stay there when new content is added.
 * Infinite scroll behavior would kick in when scrolling up.
 * @param containerRef Reference of scrollable HTML element.
 * @param contentRef Reference of content HTML element.
 * @param data Array of some data items displayed in a scrollable HTML element. It should normally come from a state.
 * @param loadMoreCb Callback for loading more data.
 * It is very important to ensure that this callback does not issue a request if end of data is reached. Otherwise target server might be spammed with requests.
 * @param options Additional options to customize hook behavior.
 */
export const useChatScroll = <TElement extends Element>(
	containerRef: React.MutableRefObject<TElement | null>,
	data: IChatScrollData,
	loadMoreCb: ILoadMoreCb,
	options?: IUseChatScrollOptions
): IUseChatScrollReturn => {
	const {
		disable: disableReverseInfiniteScroll,
		enable: enableReverseInfiniteScroll,
		enabled: reverseInfiniteScrollEnabled,
		updateLoadMoreCb
	} = useReverseInfiniteScroll(containerRef, data, loadMoreCb, options?.reverseInfiniteScroll ?? {});

	return {
		reverseInfiniteScrollEnabled,
		enableReverseInfiniteScroll,
		disableReverseInfiniteScroll,
		updateLoadMoreCb
	};
};

/**
 * Options for customizing behavior of useChatScroll hook.
 */
export interface IUseChatScrollOptions {
	/**
	 * Options for reverse infinite scroll behavior.
	 */
	reverseInfiniteScroll: IUseReverseInfiniteScrollOptions;
}

/**
 * Flags and methods provided by useChatScroll hook.
 */
export interface IUseChatScrollReturn {
	/**
	 * Indicates whether reverse infinite scroll behavior is enabled.
	 */
	reverseInfiniteScrollEnabled: boolean;

	/**
	 * Enables reverse infinite scroll behavior.
	 */
	enableReverseInfiniteScroll: () => void;

	/**
	 * Disables reverse infinite scroll behavior.
	 */
	disableReverseInfiniteScroll: () => void;

	/**
	 * Overrides callback for loading more data with a new one.
	 */
	updateLoadMoreCb: (newLoadMoreCb: ILoadMoreCb) => void;
}
