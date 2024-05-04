import { useEffect, useState } from 'react';

const useOnScreen = (ref: any) => {
	console.log(ref);
	const [isIntersecting, setIntersecting] = useState<boolean>(false);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			observer.disconnect();
		};
	}, [ref]);

	return isIntersecting;
};

export default useOnScreen;
