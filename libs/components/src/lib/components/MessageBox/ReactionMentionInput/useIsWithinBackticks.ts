import { useMemo } from 'react';

const useIsWithinBackticks = (text: string) => {
	const backticksPositions = useMemo(() => {
		const positions = {
			single: [] as number[],
			triple: [] as number[],
		};

		for (let i = 0; i < text.length; i++) {
			if (text.slice(i, i + 3) === '```') {
				positions.triple.push(i);
				i += 2; // Skip the next two characters since they are part of this triple backtick
			} else if (text[i] === '`') {
				positions.single.push(i);
			}
		}

		return positions;
	}, [text]);

	const isWithinBackticks = (index: number): boolean => {
		const singleCountBefore = backticksPositions.single.filter((pos) => pos < index).length;
		const singleCountAfter = backticksPositions.single.filter((pos) => pos > index).length;
		const tripleCountBefore = backticksPositions.triple.filter((pos) => pos < index).length;
		const tripleCountAfter = backticksPositions.triple.filter((pos) => pos > index).length;

		return singleCountBefore % 2 !== 0 || singleCountAfter % 2 !== 0 || tripleCountBefore % 2 !== 0 || tripleCountAfter % 2 !== 0;
	};

	return isWithinBackticks;
};

export default useIsWithinBackticks;
