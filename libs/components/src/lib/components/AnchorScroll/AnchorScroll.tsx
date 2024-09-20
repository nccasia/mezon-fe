import { selectTheme } from '@mezon/store';
import { mergeRefs } from '@mezon/utils';
import classNames from 'classnames';
import React, { ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHeightObserverRef } from './useHeightObserver';

type AnchorScrollProps = {
	children: ReactNode;
	anchorId?: string | number;
	className?: classNames.ArgumentArray;
};

type AnchorScrollRef = HTMLDivElement;

export const AnchorScroll = React.forwardRef<AnchorScrollRef, AnchorScrollProps>(({ children, anchorId, className }, ref) => {
	const appearanceTheme = useSelector(selectTheme);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const heightObserverRef = useHeightObserverRef();

	const scrollToBottomIfNeed = useCallback(() => {
		const element = containerRef.current;
		if (!element) {
			return;
		}
		const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 1;
		if (!isAtBottom) {
			return;
		}
		element.scrollTo(0, Number.MAX_SAFE_INTEGER);
	}, [containerRef]);

	/**
	 * before each browser repaint,
	 * we need to scroll to bottom if need,
	 * then we need to observe scroll content height
	 * to detect scroll content height change
	 */
	useLayoutEffect(() => {
		if (!containerRef.current || !contentRef.current) {
			return;
		}
		scrollToBottomIfNeed();
	}, [anchorId, containerRef, contentRef, scrollToBottomIfNeed]);

	useEffect(() => {
		if (!containerRef.current || !contentRef.current || !heightObserverRef.current) {
			return;
		}
		const { observer, setListener } = heightObserverRef.current;
		observer.observe(containerRef.current);
		observer.observe(contentRef.current);
		const disconnectResizeObserver = () => observer?.disconnect();
		setListener('onResize', () => {
			containerRef.current?.scrollTo(0, Number.MAX_SAFE_INTEGER);
		});

		let stableTimeoutId: NodeJS.Timeout | null = null;
		setListener('onStable', () => {
			const scrollContainer = containerRef.current;
			const contentElement = contentRef.current;
			if (!scrollContainer || !contentElement) {
				return;
			}
			const containerHeight = scrollContainer.getBoundingClientRect().height;
			const contentHeight = contentElement?.getBoundingClientRect().height;
			// The content’s initial height matches the container’s height,
			// so handling stable disconnections during this initial phase is incorrect.
			if (containerHeight === contentHeight) {
				return;
			}
			stableTimeoutId && clearTimeout(stableTimeoutId);
			stableTimeoutId = setTimeout(() => {
				disconnectResizeObserver();
			}, 500);
		});

		containerRef.current.addEventListener('wheel', disconnectResizeObserver, { passive: true, once: true });

		const cleanUp = () => {
			stableTimeoutId && clearTimeout(stableTimeoutId);
			containerRef?.current?.removeEventListener('wheel', disconnectResizeObserver);
			observer.disconnect();
		};

		return () => cleanUp();
	}, [anchorId, containerRef, contentRef, heightObserverRef]);

	return (
		<div className={classNames(['w-full h-full', '[&_*]:overflow-anchor-none', 'relative'])}>
			<div
				ref={mergeRefs(containerRef, ref)}
				id="scrollLoading"
				className={classNames([
					'absolute top-0 left-0 bottom-0 right-0',
					'overflow-y-scroll overflow-x-hidden',
					'dark:bg-bgPrimary bg-bgLightPrimary',
					{
						customScrollLightMode: appearanceTheme === 'light'
					},
					className
				])}
			>
				<div ref={contentRef} className={classNames(['min-h-[100%]', 'flex flex-col justify-end'])}>
					{children}
				</div>
			</div>
		</div>
	);
});
