import { useSearchMessages } from '@mezon/core';
import { HighlightMatch } from '@mezon/ui';
import React, { useMemo } from 'react';

type PlainTextOpt = {
	text: string;
	isSearchMessage?: boolean;
	isSingleLine: boolean;
	isJumMessageEnabled: boolean;
	isHover: boolean;
};

export const PlainText: React.FC<PlainTextOpt> = ({ text, isSearchMessage, isJumMessageEnabled, isSingleLine, isHover }) => {
	const { valueSearchMessage } = useSearchMessages();
	const valueSearchMessageSplitted = useMemo(() => {
		return valueSearchMessage?.trim()?.split(' ') || [];
	}, [valueSearchMessage]);

	return (
		<span className={` ${isHover && isSingleLine ? 'dark:text-white text-[#4E5057] ' : ''} `}>
			{isSearchMessage ? HighlightMatch(text, valueSearchMessageSplitted) : text}
		</span>
	);
};
export default PlainText;
