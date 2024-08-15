import { useSearchMessages } from '@mezon/core';
import { HighlightMatch } from '@mezon/ui';
import React, { useMemo } from 'react';

type PlainTextOpt = {
	text: string;
	isSearchMessage?: boolean;
};

export const PlainText: React.FC<PlainTextOpt> = ({ text, isSearchMessage }) => {
	const { valueSearchMessage } = useSearchMessages();
	const valueSearchMessageSplitted = useMemo(() => {
		return valueSearchMessage?.trim()?.split(' ') || [];
	}, [valueSearchMessage]);

	return <span>{isSearchMessage ? HighlightMatch(text, valueSearchMessageSplitted) : text}</span>;
};
export default PlainText;
