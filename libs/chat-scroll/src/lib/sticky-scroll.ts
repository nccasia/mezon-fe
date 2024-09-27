import { useCallback } from 'react';
import { useAnchor } from './anchor';

/**
 * React hook for keeping HTML element scroll at the bottom when content updates (if it is already at the bottom).
 * @param containerRef Reference of scrollable HTML element.
 * @param contentRef Reference of anchor HTML element. Scroll would be kept at anchor until user scrolls.
 * @deprecated use AnchorScroll component instead
 */
export const useStickyScroll = (
	containerRef: React.MutableRefObject<Element>,
	contentRef: React.MutableRefObject<Element>
): IUseStickyScrollResponse => {
	const anchorRef = useAnchor(containerRef, contentRef);

	/**
	 * Scrolls] to bottom
	 */
	const scrollToBottom = useCallback(() => {
		return new Promise<boolean>((resolve) => {
			// ensure view rendered before scrolling
			const element = containerRef.current;
			if (!element) {
				return resolve(false);
			}
			setTimeout(() => {
				containerRef.current?.scrollTo(0, Number.MAX_SAFE_INTEGER);
				resolve(true);
			}, 0);
		});
	}, [containerRef]);

	/**
	 * Scrolls to message with given id.
	 */
	const scrollToMessage = useCallback(
		(id: string) => {
			let scrollTimeoutId: NodeJS.Timeout | null = null;
			let highlightTimeoutId: NodeJS.Timeout | null = null;
			return new Promise<boolean>((resolve) => {
				scrollTimeoutId && clearTimeout(scrollTimeoutId);
				scrollTimeoutId = setTimeout(() => {
					requestAnimationFrame(() => {
						const messageElement = containerRef.current.querySelector(`#msg-${id}`);
						if (messageElement) {
							messageElement.scrollIntoView({ behavior: 'instant', block: 'center' });
							messageElement.classList.add('hight-light');
							if (highlightTimeoutId) {
								clearTimeout(highlightTimeoutId);
							}
							highlightTimeoutId = setTimeout(() => {
								messageElement.classList.remove('hight-light');
							}, 1000);
							return resolve(true);
						}
						return resolve(false);
					});
				}, 0);
			});
		},
		[containerRef]
	);

	/**
	 * Enables sticky scroll behavior.
	 */
	const enable = () => anchorRef.current?.enable();

	/**
	 * Disables sticky scroll behavior.
	 */
	const disable = () => anchorRef.current?.disable();

	return {
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
 * Flags and methods provided by useStickyScroll hook.
 */
export interface IUseStickyScrollResponse {
	/**
	 * Scrolls to the anchor element.
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
