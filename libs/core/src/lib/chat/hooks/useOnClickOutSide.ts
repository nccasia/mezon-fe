import { RefObject, useEffect } from 'react';

type Event = MouseEvent | TouchEvent;

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
	ref: RefObject<T> | undefined,
	handler: (event: Event) => void,
	rootElement?: RefObject<T>
) => {
	useEffect(() => {
		const el = ref?.current;
		const listener = (event: Event) => {
			if (!el || el.contains((event?.target as Node) || null)) {
				return;
			}
			if (rootElement?.current?.contains(event?.target as Node)) {
				return;
			}

			handler(event); // Call the handler only if the click is outside of the element passed.
		};

		if (el) {
			document.addEventListener('touchstart', listener);
			document.addEventListener('mousedown', listener);
		}

		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [ref, handler]); // Reload only if ref, handler, or rootElement changes
};
