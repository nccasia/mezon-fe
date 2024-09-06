import { useCallback, useEffect, useState } from 'react';
import { useScroll } from './scroll';

const ANCHOR_SCROLL_TIMEOUT = 5000;

/**
 * React hook for keeping HTML element scroll at the bottom when content updates (if it is already at the bottom).
 * @param targetRef Reference of scrollable HTML element.
 * @param anchorRef Reference of anchor HTML element. Scroll would be kept at anchor until user scrolls.
 */
export const useStickyScroll = (
	targetRef: React.MutableRefObject<Element>,
	anchorRef: React.MutableRefObject<Element>,
	options?: IUseStickyScrollOptions
): IUseStickyScrollResponse => {
	const [enabled, setEnabled] = useState<boolean>(options?.enabled ?? true);
	const { setScrollEventHandler } = useScroll(targetRef);

	/**
	 * Scrolls to anchor.
	 */
	const scrollToAnchor = useCallback(() => {
		return new Promise<boolean>((resolve) => {
			if (!anchorRef.current) {
				return resolve(false);
			}
			anchorRef.current?.scrollIntoView();
			resolve(true);
		});
	}, [anchorRef]);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		if (!targetRef.current || !anchorRef.current) {
			return;
		}

		const options = {
			root: targetRef.current,
			rootMargin: '0px',
			threshold: 1.0
		};

		let intersectTimer: NodeJS.Timeout | null = null;
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					// keep the anchor in view until the user scrolls
					intersectTimer = setTimeout(() => {
						observer.disconnect();
					}, ANCHOR_SCROLL_TIMEOUT);
				} else {
					intersectTimer && clearTimeout(intersectTimer);
					scrollToAnchor();
				}
			}
		}, options);

		setScrollEventHandler(() => {
			observer.disconnect();
		});

		observer.observe(anchorRef.current);
		return () => observer.disconnect();
	}, [enabled, targetRef, anchorRef, scrollToAnchor, setScrollEventHandler]);

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

	return {
		enabled,
		scrollToAnchor,
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
	 * Scrolls to the anchor element.
	 */
	scrollToAnchor: () => Promise<boolean>;

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
