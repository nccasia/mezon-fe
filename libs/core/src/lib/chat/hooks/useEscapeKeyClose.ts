import { RefObject, useEffect } from 'react';

export const useEscapeKeyClose = (
	ref: RefObject<HTMLElement>,
	onClose: () => void,
	options: Partial<{
		notFocus: boolean;
	}> = {}
) => {
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const { notFocus } = options;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' || event.key === 'Esc') {
				onClose();
			}
		};
		if (element) {
			!notFocus && element.focus();
			element.addEventListener('keydown', handleKeyDown);
		}
		return () => {
			if (element) {
				element.removeEventListener('keydown', handleKeyDown);
			}
		};
	}, [onClose]);
};
