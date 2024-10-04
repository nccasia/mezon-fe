import { HighlightMatchBold, Icons } from '@mezon/ui';
import { memo } from 'react';

type SelectItemProps = {
	search?: string;
	title?: string;
	content?: string;
	onClick?: () => void;
	isFocused?: boolean;
};

const SelectItemUser = ({ title, content, onClick, isFocused, search }: SelectItemProps) => {
	return (
		<button onClick={onClick} className="flex flex-row justify-between items-center w-full cursor-pointer rounded relative p-2">
			<div>
				<span className="text-textPrimaryLight dark:text-textPrimary font-semibold">{title}</span>
				<span className="text-textSecondary400 dark:text-textPrimary">{HighlightMatchBold(content ?? '', search ?? '')}</span>
			</div>
			{isFocused && (
				<div className="absolute right-2">
					<Icons.Plus />
				</div>
			)}
		</button>
	);
};

export default memo(SelectItemUser);
