import { useEffect } from 'react';

const ScrollRestorationController = () => {
	useEffect(() => {
		// Kích hoạt hoặc tắt scroll restoration khi component được mount/unmount
		const handleScrollRestoration = () => {
			if ('scrollRestoration' in window.history) {
				window.history.scrollRestoration = 'manual';
			}
		};
		console.log('worked');
		// Khi component mount
		handleScrollRestoration();

		// Khi component unmount
		return () => {
			if ('scrollRestoration' in window.history) {
				window.history.scrollRestoration = 'auto';
			}
		};
	});

	return null; // Component này không render ra gì
};

export default ScrollRestorationController;
