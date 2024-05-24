import { useThreads } from '@mezon/core';
import { threadsActions, useAppDispatch } from '@mezon/store';
import { threadError } from '@mezon/utils';
import { KeyboardEvent, useCallback } from 'react';

interface ThreadNameTextFieldProps {
	label?: string;
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>) => Promise<void>;
	error?: string;
	className?: string;
}

const ThreadNameTextField = ({ label, error, placeholder, value, className, onChange, onKeyDown }: ThreadNameTextFieldProps) => {
	const dispatch = useAppDispatch();
	const { nameThreadError } = useThreads();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(threadsActions.setNameThreadError(''));
		const value = e.target.value;
		onChange(value);
	};

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>) => {
			const element = event.target as HTMLInputElement;
			if (!(element.value || '').trim()) {
				dispatch(threadsActions.setNameThreadError(threadError.name));
			}
			onKeyDown(event);
		},
		[dispatch, onKeyDown],
	);

	return (
		<div className="flex flex-col mt-4 mb-4">
			<span className="text-xs font-semibold uppercase mb-2 dark:text-textDarkTheme text-textLightTheme">{label}</span>
			<input value={value} onChange={handleInputChange} type="text" placeholder={placeholder} className={className} onKeyDown={handleKeyDown} />
			{nameThreadError && <span className="text-xs text-[#B91C1C] mt-1 ml-1">{nameThreadError}</span>}
		</div>
	);
};

export default ThreadNameTextField;
