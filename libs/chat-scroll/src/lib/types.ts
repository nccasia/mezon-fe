/**
 * Callback which would be called every time scroll is detected close to the top of container.
 * @param beforeRender - callback which should be called AFTER additional data is gathered but BEFORE any state is updated which is used for re-render.
 * @returns Promise which is resolved AFTER DOM is updated with additional data.
 */
export type ILoadMoreCb = (direction: ELoadMoreDirection, beforeRender: IBeforeRenderCb) => Promise<any>;

/**
 * Direction of loading more data.
 */
export enum ELoadMoreDirection {
	/**
	 * Loading more data at the top.
	 */
	top,

	/**
	 * Loading more data at the bottom.
	 */
	bottom
}

/**
 * Callback which should be called AFTER additional data is gathered but BEFORE any state is updated which is used for re-render.
 */
export type IBeforeRenderCb = () => void;

/**
 * Accepted options for customizing useReverseInfiniteScroll hook.
 */
export interface IUseReverseInfiniteScrollOptions {
	/**
	 * Defines how close to the top user needs to scroll in order to invoke gathering of additional data.
	 */
	scrollThreshold?: IScrollThreshold;

	/**
	 * Defines whether infinite scroll behavior is enabled initially.
	 */
	enabled?: boolean;

	/**
	 * Callback when scroll reaches top.
	 */
	onReachTop?: () => void;

	/**
	 * Callback when scroll reaches bottom.
	 */
	onReachBottom?: () => void;
}

/**
 * Defines how close to the top user needs to scroll in order to invoke gathering of additional data.
 */
export interface IScrollThreshold {
	/**
	 * Defines how threshold is calculated.
	 */
	type?: EScrollThresholdType;

	/**
	 * Threshold value.
	 */
	value?: number;
}

/**
 * Defines how threshold is calculated.
 */
export enum EScrollThresholdType {
	/**
	 * Fraction of content height left to the top (for example 0.2).
	 */
	fraction,

	/**
	 * Distance to top in pixels.
	 */
	pixels
}

/**
 * Flags and methods provided by useReverseInfiniteScroll hook.
 */
export interface IUseReverseInfiniteScrollResponse {
	/**
	 * Indicates whether reverse infinite scroll behavior is enabled.
	 */
	enabled: boolean;

	/**
	 * Enables reverse infinite scroll behavior.
	 */
	enable: () => void;

	/**
	 * Disables reverse infinite scroll behavior.
	 */
	disable: () => void;

	/**
	 * Overrides callback for loading more data with a new one.
	 */
	updateLoadMoreCb: (newLoadMoreCb: ILoadMoreCb) => void;
}

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

/**
 * Scroll event handler.
 */
export type IScrollEventHandler = (event: Event) => void;

/**
 * Flags and methods provided by useScroll hook.
 */
export interface IUseScrollResponse {
	/**
	 * Verifies whether target element is currently fetching data.
	 */
	isFetching: () => boolean;

	/**
	 * Marks target element as currently fetching data.
	 */
	setFetching: () => void;

	/**
	 * Marks target element as currently not fetching data.
	 */
	setFetched: () => void;

	/**
	 * Gathers current scroll height for target element.
	 */
	getCurrentScrollHeight: () => number;

	/**
	 * Gathers current scroll position of target element.
	 */
	getScrollTop: () => number;

	/**
	 * Gathers height of target element client area.
	 */
	getClientHeight: () => number;

	/**
	 * Scrolls target element.
	 * @param offset Scroll position from the top.
	 */
	setScrollTop: (offset: number) => void;

	/**
	 * Gathers last stored value of target element scroll height.
	 */
	getStoredScrollHeight: () => number;

	/**
	 * Stores current scroll height of target element for later use.
	 */
	storeCurrentScrollHeight: () => void;

	/**
	 * Gathers last stored value of target element scroll top offset.
	 */
	getStoredScrollTop: () => number;

	/**
	 * Stores current scroll offset of target element for later use.
	 */
	storeCurrentScrollTop: () => void;

	/**
	 * Overrides scroll event handler to a new one.
	 */
	setScrollEventHandler: (newScrollHandler: IScrollEventHandler) => void;
}
