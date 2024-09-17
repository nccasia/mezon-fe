import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const MAX_RESIZE_TIME = 5;
const UI_STABLE_TIME = 1000;

const createResizeObserver = (listenersMap: Map<Element, (entry: ResizeObserverEntry) => void>) => {
	const expectedSize = new WeakMap<ResizeObserverEntry, DOMRectReadOnly>();
	return new ResizeObserver((entries) => {
		entries.forEach((entry) => {
			const previousHeight = expectedSize.get(entry)?.height;
			expectedSize.set(entry, entry.contentRect);
			if (previousHeight === entry.contentRect.height) {
				return;
			}
			const handler = listenersMap.get(entry.target);
			if (handler) {
				handler(entry);
			}
		});
	});
};

export const useAnchor = (containerRef: React.MutableRefObject<Element>, contentRef: React.MutableRefObject<Element>) => {
	const anchor = useRef<{
		resizeObserver: ResizeObserver;
		listenersMap: Map<Element, (entry: ResizeObserverEntry) => void>;
		enabled: boolean;
		isStable: boolean;
		enable: () => void;
		disable: () => void;
		isAtBottom: (element: Element) => boolean;
	} | null>(null);
	if (anchor.current === null) {
		const listenersMap = new Map<Element, (entry: ResizeObserverEntry) => void>();
		anchor.current = {
			resizeObserver: createResizeObserver(listenersMap),
			listenersMap: listenersMap,
			isStable: false,
			enabled: true,
			enable: () => anchor.current && (anchor.current.enabled = true),
			disable: () => {
				anchor.current && (anchor.current.enabled = false);
			},
			isAtBottom: (element: Element) => {
				if (!element) {
					return false;
				}
				return element.scrollHeight - element.scrollTop - element.clientHeight < 1;
			}
		};
	}

	const scrollToBottomIfNeeded = useCallback(() => {
		const element = containerRef.current;
		if (!element) {
			return;
		}
		const isAtBottom = anchor.current?.isAtBottom(element);
		if (isAtBottom) {
			return;
		}
		containerRef.current?.scrollTo(0, Number.MAX_SAFE_INTEGER);
	}, [containerRef]);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;
		timeoutId = setTimeout(() => {
			scrollToBottomIfNeeded();
		}, 0);
		return () => {
			timeoutId && clearTimeout(timeoutId);
		};
	}, [scrollToBottomIfNeeded]);

	useLayoutEffect(() => {
		const containerElement = containerRef?.current;
		const contentElement = contentRef?.current;
		let resizeTimeoutId: NodeJS.Timeout | null = null;
		let resizeHandlerId: number | null = null;
		let wheelHandler: (() => void) | null = null;
		const cleanUp = () => {
			resizeTimeoutId && clearTimeout(resizeTimeoutId);
			resizeHandlerId && cancelAnimationFrame(resizeHandlerId);
			contentElement && anchor.current?.resizeObserver?.unobserve(contentElement);
			containerElement && wheelHandler && containerElement.removeEventListener('wheel', wheelHandler);
		};

		if (containerElement && contentElement && anchor.current) {
			const { resizeObserver, listenersMap } = anchor.current;
			anchor.current.isStable = false;
			let resizeTime = 0;
			listenersMap.set(contentElement, () => {
				if (!anchor.current) {
					return;
				}

				if (anchor.current.isStable || !anchor.current.enabled) {
					return;
				}

				// handle scroll to bottom if the content is resized during browser painting
				if (resizeTime < MAX_RESIZE_TIME) {
					resizeHandlerId = requestAnimationFrame(() => {
						scrollToBottomIfNeeded();
						resizeTime++;
						// assume the UI is stable after a certain time
						resizeTimeoutId && clearTimeout(resizeTimeoutId);
						resizeTimeoutId = setTimeout(() => {
							if (anchor.current) {
								anchor.current.isStable = true;
							}
						}, UI_STABLE_TIME);
					});
				}
			});

			resizeObserver.observe(contentElement, { box: 'border-box' });

			wheelHandler = () => {
				cleanUp();
			};

			// When user wheel the chat, disable the sticky scroll behavior
			// Use passive mode to ensure that the wheel is uncanceled and does not block the rendering
			containerElement.addEventListener('wheel', wheelHandler, { passive: true });
		}
		return () => cleanUp();
	}, [containerRef, contentRef, scrollToBottomIfNeeded]);

	return anchor;
};
