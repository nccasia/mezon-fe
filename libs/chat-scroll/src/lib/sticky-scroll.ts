import { useCallback, useEffect, useRef, useState } from 'react';
import { useScroll } from './scroll';

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

	const moveScrollToBottom = useCallback(async () => {
		targetRef.current.scrollTop = targetRef.current.scrollHeight;
		return true;
	}, [targetRef]);

	useEffect(() => {
		stickyRef.current = sticky;
		if (sticky) {
			console.log('scrolling to bottom');
			moveScrollToBottom();
		}
	}, [data.data.length, targetRef, sticky, moveScrollToBottom]);

	const updateStuckToBottom = useCallback(() => {
		const { scrollHeight, clientHeight, scrollTop } = targetRef.current;
		const currentlyAtBottom = scrollHeight === scrollTop + clientHeight;

		if (stickyRef.current && !currentlyAtBottom) {
			console.log('not at bottom');
			setSticky(false);
		} else if (!stickyRef.current && currentlyAtBottom) {
			console.log('at bottom');
			setSticky(true);
		}
	}, [targetRef]);

	const handleScroll = useCallback(() => {
		console.log('scrolling');
		updateStuckToBottom();
	}, [updateStuckToBottom]);

	const { setScrollEventHandler } = useScroll(targetRef);

	useEffect(() => {
		console.log('enabled', enabled);
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
	const scrollToBottom = async () => {
		await moveScrollToBottom();
		setSticky(true);
		return true;
	};

	/**
	 * Scrolls to message with given id.
	 */
	const scrollToMessage = async (id: string) => {
		const messageElement = targetRef.current.querySelector(`#${id}`);
		if (messageElement) {
			messageElement.scrollIntoView();
			return true;
		}
		return false;
	};

	/**
	 * Enables sticky scroll behavior.
	 */
	const enable = () => setEnabled(true);

	/**
	 * Disables sticky scroll behavior.
	 */
	const disable = () => setEnabled(false);

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
