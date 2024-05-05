import { useEffect, useState } from 'react';

const useOnScreen = (ref: HTMLDivElement | null) => {
	const [isIntersecting, setIntersecting] = useState<boolean>(false);

	useEffect(() => {
		if (!ref) return; // Bỏ qua nếu ref là null

		const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));

		observer.observe(ref);

		return () => {
			observer.disconnect();
		};
	}, [ref]);

	return isIntersecting;
};

export default useOnScreen;
