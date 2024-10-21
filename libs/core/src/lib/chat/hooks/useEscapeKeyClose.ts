import { RefObject, useEffect } from 'react';

export const useEscapeKeyClose = (ref: RefObject<HTMLElement> | undefined, onClose: () => void) => {
	useEffect(() => {
		const element = ref?.current;
		if (!element) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' || event.key === 'Esc') {
				onClose();
			}
		};
		if (document.activeElement !== element && !element?.contains(document.activeElement)) {
			element.focus();
		}
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [ref, onClose]);
};
