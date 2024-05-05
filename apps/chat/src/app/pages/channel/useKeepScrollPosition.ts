import { IMessageWithUser } from '@mezon/utils';
import { useLayoutEffect, useMemo, useRef } from 'react';

const useKeepScrollPosition = (deps: IMessageWithUser[]) => {
	const containerRef = useRef<HTMLDivElement>(null);

	const previousScrollPosition = useRef(0);

	useMemo(() => {
		if (containerRef.current) {
			const container = containerRef.current;
			previousScrollPosition.current = container.scrollHeight - container.scrollTop;
		}
	}, [...deps]);

	useLayoutEffect(() => {
		const container = containerRef.current;

		const handleScroll = () => {
			console.log('sd');
			if (container) {
				previousScrollPosition.current = container.scrollHeight - container.scrollTop;
			}
		};

		if (container) {
			// Gắn sự kiện onscroll vào phần tử
			container.addEventListener('scroll', handleScroll);
		}

		return () => {
			if (container) {
				// Gỡ bỏ sự kiện onscroll khi component bị unmount
				container.removeEventListener('scroll', handleScroll);
			}
		};
	}, [...deps]);

	return {
		containerRef,
	};
};

export default useKeepScrollPosition;
