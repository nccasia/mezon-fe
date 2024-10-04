import React, { useEffect, useState } from 'react';

interface Props {
	items: string[];
	delayTime?: number;
}

const DelayedDisplay: React.FC<Props> = ({ items, delayTime }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
			setCurrentIndex((currentIndex + 1) % items.length);
		}, delayTime);

		return () => clearTimeout(timer);
	}, [currentIndex, delayTime, items.length]);

	return (
		<>
			{isLoading ? null : (
				<div className={`text-white flex flex-row items-center text-sm h-full justify-center`}>
					<p className="text-[1rem]">{items[currentIndex]}</p>
				</div>
			)}
		</>
	);
};

export const Loading: React.FC = () => {
	const items = ['●', '● ●', '● ● ●'];
	const delayTime = 100;

	return <DelayedDisplay items={items} delayTime={delayTime} />;
};
