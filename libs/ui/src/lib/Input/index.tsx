import { useApp } from '@mezon/core';
import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'dangerouslySetInnerHTML'> {
	type: string;
	label?: string;
	className?: string;
	required?: boolean;
	maxLength?: number;
}

const InputField: React.FC<InputProps> = ({ type, className, maxLength, label, required, ...rest }) => {
	const { appearanceTheme } = useApp();
	return (
		<div className="w-full">
			<div className={'text-[14px]'}>
				{label}
				{required && <span className={'text-colorDanger'}> *</span>}
			</div>
			<input
				type={type}
				className={`dark:bg-bgTertiary bg-[#F0F0F0] font-[400]  px-[16px] rounded w-full dark:text-white text-black outline-none ${className} ${appearanceTheme === "light" ? "lightEventInputAutoFill" : ""}`}
				{...rest}
				maxLength={maxLength}
				multiple
			/>
		</div>
	);
};

export default InputField;
