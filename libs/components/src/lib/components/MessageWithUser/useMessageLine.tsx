import { IMessageLine } from '@mezon/utils';
import { useMemo } from 'react';

// TODO: refactor this to sender function

export function useMessageLine(line: string): IMessageLine {
	const combinedRegex = /(?<!`)((?<=\s|^)(@|#)\S+(?=\s|$)|:(?!\d+:)\b[^:`\s]*\b:)(?!`)/g;

	const emojiRegex = /^:\b[^:]*\b:$/;

	const isOnlyEmoji = useMemo(() => {
		if (!line.trim()) {
			return false;
		}

		return emojiRegex.test(line);
	}, [line]);

	const matches = useMemo(() => {
		if (line) {
			return line.match(combinedRegex) || [];
		} else {
			return [];
		}
	}, [line]);

	const mentions = useMemo(() => {
		let lastIndex = 0;
		let nonMatchText = line;

		const mentions = matches.map((match, i) => {
			const startIndex = line.indexOf(match, lastIndex);
			const endIndex = startIndex + match.length;
			const matchedText = line.substring(startIndex, endIndex);
			nonMatchText = line.substring(lastIndex, startIndex);
			lastIndex = endIndex;
			return {
				nonMatchText,
				matchedText,
				startIndex,
				endIndex,
			};
		});
		if (mentions.length === 0) {
			// not match mention
			return [
				{
					nonMatchText: nonMatchText,
					matchedText: '',
					startIndex: 0,
					endIndex: 0,
				},
			];
		}
		if (lastIndex < line.length) {
			mentions.push({
				nonMatchText: line.substring(lastIndex),
				matchedText: '',
				startIndex: lastIndex,
				endIndex: line.length,
			});
		}
		return mentions;
	}, [line, matches]);

	return {
		mentions,
		isOnlyEmoji,
	};
}
