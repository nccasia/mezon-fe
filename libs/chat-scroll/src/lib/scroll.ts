import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * React hook for controlling scrollable HTML element.
 * @private
 * @param targetRef Reference of scrollable HTML element.
 */
export const useScroll = (targetRef: React.MutableRefObject<Element>): IUseScrollResponse => {
	const scrollEventHandlerRef = useRef<EventListener>(() => {
		return;
	});

	const [handlerId, setHandlerId] = useState<number>(1);

	const setScrollEventHandler = useCallback((handler: EventListener) => {
		scrollEventHandlerRef.current = handler;
		setHandlerId((prev) => prev + 1);
	}, []);

	useEffect(() => {
		const handler = scrollEventHandlerRef.current;
		const el = targetRef.current;

		handler({} as Event);
		el.addEventListener('scroll', handler);

		return () => {
			el.removeEventListener('scroll', handler);
		};
	}, [handlerId, targetRef]);

	const fetching = useRef<boolean>(false);
	const storedScrollHeight = useRef<number>(0);
	const storedScrollTop = useRef<number>(0);

	const isFetching = useCallback(() => fetching.current, []);

	const setFetching = useCallback(() => {
		fetching.current = true;
	}, []);

	const setFetched = useCallback(() => {
		fetching.current = false;
	}, []);

	const getCurrentScrollHeight = useCallback(() => targetRef.current?.scrollHeight, [targetRef]);

	const getScrollTop = useCallback(() => targetRef.current.scrollTop, [targetRef]);

	const setScrollTop = useCallback(
		(offset: number) => {
			targetRef.current.scrollTop = offset;
		},
		[targetRef],
	);

	const getStoredScrollHeight = useCallback(() => storedScrollHeight.current, []);

	const storeCurrentScrollHeight = useCallback(() => {
		storedScrollHeight.current = targetRef.current.scrollHeight;
	}, [targetRef]);

	const getStoredScrollTop = useCallback(() => storedScrollTop.current, []);

	const storeCurrentScrollTop = useCallback(() => {
		storedScrollTop.current = targetRef.current.scrollTop;
	}, [targetRef]);

	const getClientHeight = useCallback(() => targetRef.current.clientHeight, [targetRef]);

	return {
		isFetching,
		setFetching,
		setFetched,
		getCurrentScrollHeight,
		getScrollTop,
		setScrollTop,
		getClientHeight,
		getStoredScrollHeight,
		storeCurrentScrollHeight,
		getStoredScrollTop,
		storeCurrentScrollTop,
		setScrollEventHandler,
	};
};

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
