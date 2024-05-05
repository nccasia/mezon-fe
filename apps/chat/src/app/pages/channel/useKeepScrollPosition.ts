import { IMessageWithUser } from '@mezon/utils';
import { useLayoutEffect, useMemo, useRef } from 'react';

const useKeepScrollPosition = (deps: IMessageWithUser[]) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const previousScrollPosition = useRef(0);
	console.log(containerRef?.current?.scrollHeight);
	console.log(deps);
	// useMemo(() => {
	// 	if (containerRef?.current) {
	// 		const container = containerRef.current;
	// 		previousScrollPosition.current = container.scrollHeight - container.scrollTop;
	// 		console.log(previousScrollPosition.current);
	// 	}
	// }, [deps]);

	useLayoutEffect(() => {
		if (containerRef?.current) {
			const container = containerRef.current || {};
			container.scrollTop = container.scrollHeight;
			console.log(container.scrollHeight);
		}
	}, [deps]);

	return {
		containerRef,
	};
};

export default useKeepScrollPosition;
