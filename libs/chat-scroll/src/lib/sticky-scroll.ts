import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useScroll } from './scroll';

// brute force function to execute a function multiple times with a time limit
// using requestAnimationFrame to ensure smooth execution
function brushForceCall(fn: () => boolean, totalMs: number) {
	const startTime = Date.now();
	let lastTime = startTime;
	let lastResult = false;

	function loop() {
		if (Date.now() - startTime > totalMs) {
			return;
		}

		const result = fn();
		if (result) {
			return;
		}

		if (lastResult) {
			lastTime = Date.now();
		}

		lastResult = result;
		return requestAnimationFrame(loop);
	}

	const animationFrameId = loop();

	return {
		cancel: () => animationFrameId && cancelAnimationFrame(animationFrameId),
	};
}

/**
 * React hook for keeping HTML element scroll at the bottom when content updates (if it is already at the bottom).
 * @param targetRef Reference of scrollable HTML element.
 * @param data Array of some data items displayed in a scrollable HTML element. It should normally come from a state.
 */
export const useStickyScroll = (
	targetRef: React.MutableRefObject<Element>,
	data: IChatScrollData,
	options?: IUseStickyScrollOptions,
): IUseStickyScrollResponse => {
	const [enabled, setEnabled] = useState<boolean>(options?.enabled ?? true);
	const [sticky, setSticky] = useState<boolean>(true);
	const stickyRef = useRef(sticky);
	const animationRef = useRef<ReturnType<typeof brushForceCall>>();
	const { setScrollEventHandler } = useScroll(targetRef);

	const { data: items } = data;

	const lastItemId = useMemo(() => {
		return items.length > 0 ? items[items.length - 1] : '';
	}, [items]);

	const moveScrollToBottom = useCallback(async () => {
		if (animationRef.current) {
			animationRef.current.cancel();
		}

		if (!targetRef.current) {
			return false;
		}

		function moveScroll() {
      console.log('moveScroll');
			targetRef.current.scrollTop = targetRef.current.scrollHeight;
			return false;
		}

		// try to move scroll to bottom multiple times to ensure it is at the bottom
		// that is because sometimes the message is not yet rendered
		// and scroll is not at the bottom
		// animationRef.current = brushForceCall(moveScroll, 500);

		// temporary fix for the stuck scroll issue
		moveScroll();
		return true;
	}, [targetRef, animationRef]);

	const updateStuckToBottom = useCallback(() => {
    if (!targetRef.current) {
      return;
    }
		const { scrollHeight, clientHeight, scrollTop } = targetRef.current;
		const currentlyAtBottom = scrollHeight === scrollTop + clientHeight;

		if (stickyRef.current && !currentlyAtBottom) {
			setSticky(false);
		} else if (!stickyRef.current && currentlyAtBottom) {
			setSticky(true);
		}
	}, [targetRef, stickyRef]);

	const handleScroll = useCallback(
		(e: Event) => {
			updateStuckToBottom();
		},
		[updateStuckToBottom],
	);

	useEffect(() => {
		if (enabled) {
			setScrollEventHandler(handleScroll);
		} else {
			setScrollEventHandler(() => {
				return;
			});
		}
	}, [enabled, handleScroll, setScrollEventHandler]);

	/**
	 * Scrolls to bottom.
	 */
	const scrollToBottom = useCallback(async () => {
		await moveScrollToBottom();
		setSticky(true);
		return true;
	}, [moveScrollToBottom]);

	/**
	 * Scrolls to message with given id.
	 */
	const scrollToMessage = async (id: string) => {
		if (animationRef.current) {
			animationRef.current.cancel();
		}

		if (!targetRef.current) {
			return false;
		}

		function moveScroll() {
			const messageElement = targetRef.current.querySelector(`#${id}`);
			if (messageElement) {
				messageElement.scrollIntoView();
				return true;
			}
			return false;
		}

		// try to move scroll to message multiple times to ensure it is at the message
		// that is because sometimes the message is not yet rendered
		// animationRef.current = brushForceCall(moveScroll, 500);

		// temporary fix for the stuck scroll issue
		moveScroll();
		return true;
	};

	/**
	 * Enables sticky scroll behavior.
	 */
	const enable = () => setEnabled(true);

	/**
	 * Disables sticky scroll behavior.
	 */
	const disable = () => setEnabled(false);

	// update sticky scroll state when data changes
	useEffect(() => {
		stickyRef.current = sticky;
		if (sticky) {
			scrollToBottom();
		}
	}, [lastItemId, targetRef, sticky, scrollToBottom]);

	return {
		enabled,
		sticky,
		scrollToBottom,
		scrollToMessage,
		enable,
		disable,
	};
};

/**
 * Data and metadata for chat scroll.
 */
export interface IChatScrollData {
	/**
	 * Array of data items displayed in a scrollable HTML element.
	 */
	data: any[];

	/**
	 * has next page
	 */
	hasNextPage: boolean;

	/**
	 * has previous page
	 */
	hasPreviousPage: boolean;
}

/**
 * Accepted options for customizing useStickyScroll hook.
 */
export interface IUseStickyScrollOptions {
	/**
	 * Defines whether sticky scroll behavior is enabled initially.
	 */
	enabled?: boolean;

	/**
	 * Defines sticky scroll threshold.
	 */
	threshold?: number;
}

/**
 * Flags and methods provided by useStickyScroll hook.
 */
export interface IUseStickyScrollResponse {
	/**
	 * True when sticky scroll behavior is enabled.
	 */
	enabled: boolean;

	/**
	 * True when scroll is stuck to the bottom of target element.
	 */
	sticky: boolean;

	/**
	 * Scrolls to bottom of the target element.
	 */
	scrollToBottom: () => Promise<boolean>;

	/**
	 * Scrolls to message with given id.
	 */
	scrollToMessage: (id: string) => Promise<boolean>;

	/**
	 * Enables sticky scroll behavior.
	 */
	enable: () => void;

	/**
	 * Disables sticky scroll behavior.
	 */
	disable: () => void;
}
