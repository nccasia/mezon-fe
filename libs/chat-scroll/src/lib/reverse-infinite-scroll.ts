import { useCallback, useEffect, useRef, useState } from 'react';
import { useScroll } from './scroll';
import { IChatScrollData } from './sticky-scroll';

/**
 * React hook for enabling reverse infinite scroll on HTML container when scroll reaches top.
 * @private
 * @param targetRef Reference of scrollable HTML element.
 * @param loadMoreCb Callback for loading more data.
 * It is very important to ensure that this callback does not issue a request if end of data is reached. Otherwise target server might be spammed with requests.
 * @param options Additional options to customize hook behavior.
 */
export const useReverseInfiniteScroll = (
	targetRef: React.MutableRefObject<Element>,
	data: IChatScrollData,
	loadMoreCb: ILoadMoreCb,
	options?: IUseReverseInfiniteScrollOptions
): IUseReverseInfiniteScrollResponse => {
	const loadMoreRef = useRef<ILoadMoreCb>(loadMoreCb);

	const {
		scrollThresholdType,
		scrollThresholdValue,
		enabled: initialEnabled,
		onReachTop,
		onReachBottom
	} = useReverseInfiniteScrollOptions(options || {});

	const { hasPreviousPage, hasNextPage } = data;

	const [enabled, setEnabled] = useState(initialEnabled);

	const {
		setScrollEventHandler,
		getCurrentScrollHeight,
		getStoredScrollHeight,
		getStoredScrollTop,
		isFetching,
		setFetched,
		setFetching,
		getScrollTop,
		setScrollTop,
		getClientHeight,
		storeCurrentScrollHeight,
		storeCurrentScrollTop
	} = useScroll(targetRef);

	// need more data at the top
	// when user scrolls to the top of the container
	// check if we need to load more data
	const needMore = useCallback(() => {
		if (!hasPreviousPage) {
			return false;
		}
		const checkMap = {
			[EScrollThresholdType.fraction]: () => getScrollTop() <= getCurrentScrollHeight() * scrollThresholdValue,
			[EScrollThresholdType.pixels]: () => getScrollTop() <= scrollThresholdValue
		};

		return checkMap[scrollThresholdType]?.() ?? false;
	}, [hasPreviousPage, getScrollTop, getCurrentScrollHeight, scrollThresholdType, scrollThresholdValue]);

	// need more data at the bottom
	// when user scrolls to the bottom of the container
	// check if we need to load more data
	const needMoreBottom = useCallback(() => {
		if (!hasNextPage) {
			return false;
		}

		// is scroll reached bottom
		// concept: Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
		return Math.abs(getCurrentScrollHeight() - getScrollTop() - getClientHeight()) < 1;
	}, [hasNextPage, getClientHeight, getCurrentScrollHeight, getScrollTop]);

	const isReachTop = useCallback(() => getScrollTop() === 0, [getScrollTop]);

	const isReachBottom = useCallback(() => {
		const { scrollHeight, clientHeight, scrollTop } = targetRef.current;
		return scrollHeight === scrollTop + clientHeight;
	}, [targetRef]);

	const handleScroll = useCallback(async () => {
		if (isReachTop()) {
			onReachTop();
		}

		if (isReachBottom()) {
			onReachBottom();
		}

		if (!isFetching() && needMore()) {
			setFetching();
			const itemsHeightCache = new Map<string, number>();

			await loadMoreRef.current(ELoadMoreDirection.top, () => {
				storeCurrentScrollHeight();
				storeCurrentScrollTop();

				// store height of each item
				const items = targetRef.current.querySelectorAll('.message-container');

				items.forEach((item) => {
					const id = item.getAttribute('id');
					if (id) {
						itemsHeightCache.set(id, item.clientHeight);
					}
				});
			});

			const cachedItems = itemsHeightCache.entries();

			let removedHeight = 0;
			for (const [id, height] of cachedItems) {
				const item = targetRef.current.querySelector(`#${id}`);
				if (!item) {
					removedHeight += height;
				}
			}
			const diff = getCurrentScrollHeight() - getStoredScrollHeight() + removedHeight;
			setScrollTop(getStoredScrollTop() + diff);

			setFetched();
		} else if (!isFetching() && needMoreBottom()) {
			setFetching();

			await loadMoreRef.current(ELoadMoreDirection.bottom, () => {
				storeCurrentScrollHeight();
				storeCurrentScrollTop();
			});

			setFetched();
		}
	}, [
		isReachTop,
		isReachBottom,
		isFetching,
		needMore,
		needMoreBottom,
		onReachTop,
		onReachBottom,
		setFetching,
		getCurrentScrollHeight,
		getStoredScrollHeight,
		setScrollTop,
		getStoredScrollTop,
		setFetched,
		storeCurrentScrollHeight,
		storeCurrentScrollTop,
		targetRef
	]);

	useEffect(() => {
		if (enabled) {
			setScrollEventHandler(handleScroll);
		} else {
			setScrollEventHandler(() => {
				return;
			});
		}
	}, [enabled, handleScroll, setScrollEventHandler]);

	const enable = () => setEnabled(true);

	const disable = () => setEnabled(false);

	const updateLoadMoreCb = (newLoadMoreCb: ILoadMoreCb) => {
		loadMoreRef.current = newLoadMoreCb;
	};

	return { enable, disable, updateLoadMoreCb, enabled };
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const DUMMY_FN = () => {};

/**
 * Handles default values for useReverseInfiniteScroll hook options.
 * @private
 * @param options Additional options to customize hook behavior.
 */
const useReverseInfiniteScrollOptions = (options: IUseReverseInfiniteScrollOptions) => {
	const scrollThresholdType = options?.scrollThreshold?.type ?? EScrollThresholdType.fraction;

	const scrollThresholdValue = (options?.scrollThreshold?.value ?? scrollThresholdType === EScrollThresholdType.fraction) ? 0.2 : 1000;

	const enabled = options?.enabled ?? true;

	const onReachTop = options?.onReachTop || DUMMY_FN;

	const onReachBottom = options?.onReachBottom || DUMMY_FN;

	return { scrollThresholdType, scrollThresholdValue, enabled, onReachTop, onReachBottom };
};

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
