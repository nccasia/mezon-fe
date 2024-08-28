import { KMPHighlight, normalizeString } from '@mezon/utils';

const HighlightMatch = (content: string, valueSearch: string[]) => {
	const normalizedSearchTerms = valueSearch.flatMap((term) => normalizeString(term).split(/\s+/)).filter((term) => term.length > 0);

	const normalizedItemName = normalizeString(content);

	if (normalizedSearchTerms.length === 0) return content;

	const matchPositions: { start: number; end: number; key: number }[] = [];

	normalizedSearchTerms.forEach((term, termIndex) => {
		const positions = KMPHighlight(normalizedItemName, term);
		positions.forEach((position) => {
			matchPositions.push({
				start: position,
				end: position + term.length,
				key: termIndex
			});
		});
	});

	matchPositions.sort((a, b) => a.start - b.start);

	const parts: (string | JSX.Element)[] = [];
	let startIndex = 0;

	matchPositions.forEach((match) => {
		if (match.start >= startIndex) {
			const beforeMatch = content.slice(startIndex, match.start);
			if (beforeMatch) {
				parts.push(beforeMatch);
			}

			const highlightedText = content.slice(match.start, match.end);
			parts.push(
				<span className="bg-[#FAE7C1] dark:bg-[#6A5936]" key={`${match.key}-${match.start}`}>
					{highlightedText}
				</span>
			);

			startIndex = match.end;
		}
	});

	if (startIndex < content.length) {
		parts.push(content.slice(startIndex));
	}

	return <>{parts}</>;
};

export default HighlightMatch;
