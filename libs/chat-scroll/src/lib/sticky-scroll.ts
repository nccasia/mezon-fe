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
		cancel: () => animationFrameId && cancelAnimationFrame(animationFrameId)
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
	options?: IUseStickyScrollOptions
): IUseStickyScrollResponse => {
	const [enabled, setEnabled] = useState<boolean>(options?.enabled ?? true);
	const [sticky, setSticky] = useState<boolean>(true);
	const stickyRef = useRef(sticky);
	const { setScrollEventHandler } = useScroll(targetRef);

	const { data: messages } = data;

	const lastMessageId = useMemo(() => {
		return messages.length > 0 ? messages[messages.length - 1]?.id : null;
	}, [messages]);

	const moveScrollToBottom = useCallback(() => {
		return new Promise<boolean>((resolve) => {
			if (!targetRef.current) {
				return resolve(false);
			}
			targetRef.current.scrollTop = targetRef.current.scrollHeight;
			resolve(true);
		});
	}, [targetRef]);

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
		[updateStuckToBottom]
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
	const scrollToMessage = useCallback(
		(id: string) => {
			let scrollTimeoutId: NodeJS.Timeout | null = null;
			return new Promise<boolean>((resolve) => {
				scrollTimeoutId && clearTimeout(scrollTimeoutId);
				scrollTimeoutId = setTimeout(() => {
					requestAnimationFrame(() => {
						const messageElement = targetRef.current.querySelector(`#msg-${id}`);
						if (messageElement) {
							messageElement.scrollIntoView({ behavior: 'instant' });
							return resolve(true);
						}
						return resolve(false);
					});
				}, 0);
			});
		},
		[targetRef]
	);

	/**
	 * Enables sticky scroll behavior.
	 */
	const enable = () => setEnabled(true);

	/**
	 * Disables sticky scroll behavior.
	 */
	const disable = () => setEnabled(false);

	useEffect(() => {
		requestAnimationFrame(() => {
			scrollToBottom();
		});
	}, []);

	// update sticky scroll state when data changes
	useEffect(() => {
		stickyRef.current = sticky;
		if (sticky) {
			scrollToMessage(lastMessageId);
		}
	}, [lastMessageId, stickyRef, sticky, scrollToMessage]);

	return {
		enabled,
		sticky,
		scrollToBottom,
		scrollToMessage,
		enable,
		disable
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
