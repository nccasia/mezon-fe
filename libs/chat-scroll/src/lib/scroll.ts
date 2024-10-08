import { useCallback, useEffect, useRef, useState } from 'react';
import { IScrollOptions, SCROLL_DEFAULT_OPTIONS } from './scroll-options';
import { IUseScrollResponse } from './types';

/**
 * React hook for controlling scrollable HTML element.
 * @private
 * @param targetRef Reference of scrollable HTML element.
 */
export const useScroll = <TElement extends Element>(
	targetRef: React.MutableRefObject<TElement | null>,
	options: IScrollOptions = SCROLL_DEFAULT_OPTIONS
): IUseScrollResponse => {
	const scrollEventHandlerRef = useRef<EventListener>(() => {
		return;
	});

	const [handlerId, setHandlerId] = useState<number>(1);

	const setScrollEventHandler = useCallback((handler: EventListener) => {
		scrollEventHandlerRef.current = handler;
		setHandlerId((prev) => prev + 1);
	}, []);

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

	const getCurrentScrollHeight = useCallback(() => targetRef.current?.scrollHeight ?? 0, [targetRef]);

	const getScrollTop = useCallback(() => targetRef.current?.scrollTop ?? 0, [targetRef]);

	const setScrollTop = useCallback(
		(offset: number) => {
			if (targetRef.current) {
				targetRef.current.scrollTop = offset;
			}
		},
		[targetRef]
	);

	const getStoredScrollHeight = useCallback(() => storedScrollHeight.current, []);

	const storeCurrentScrollHeight = useCallback(() => {
		storedScrollHeight.current = targetRef.current?.scrollHeight ?? 0;
	}, [targetRef]);

	const getStoredScrollTop = useCallback(() => storedScrollTop.current, []);

	const storeCurrentScrollTop = useCallback(() => {
		storedScrollTop.current = targetRef.current?.scrollTop ?? 0;
	}, [targetRef]);

	const getClientHeight = useCallback(() => targetRef.current?.clientHeight ?? 0, [targetRef]);

	useEffect(() => {
		let scrollHandlerTimeoutId: NodeJS.Timeout;
		let handler: (event: Event) => void;
		if (Number.isInteger(options?.debounce)) {
			handler = (event: Event) => {
				scrollHandlerTimeoutId && clearTimeout(scrollHandlerTimeoutId);
				scrollHandlerTimeoutId = setTimeout(() => {
					scrollEventHandlerRef.current(event);
				}, options?.debounce as number);
			};
		} else {
			handler = scrollEventHandlerRef.current;
		}

		const el = targetRef.current;

		el?.addEventListener('wheel', handler);

		return () => {
			scrollHandlerTimeoutId && clearTimeout(scrollHandlerTimeoutId);
			el?.removeEventListener('wheel', handler);
		};
	}, [handlerId, targetRef, options]);

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
		setScrollEventHandler
	};
};
