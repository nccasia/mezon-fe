import { Select } from 'flowbite-react';
import { connectField, HTMLFieldProps } from 'uniforms';

type CustomFormFieldProps = HTMLFieldProps<string, HTMLDivElement> & {
	label?: string;
	options?: { label: string; value: string }[]; // Options for the select field
};
function CustomSelectField({
	onChange,
	value,
	label,
	errorMessage,
	showInlineError,
	fieldType,
	changed,
	options = [],
	...props
}: CustomFormFieldProps) {
	return (
		<div className="ImageField mt-2">
			{label && <label className="block text-sm">{label}</label>}
			<Select
				onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
					onChange(event.target.value);
				}}
				value={value || ''}
				disabled={props.disabled}
				name={props.name}
				ref={undefined}
				required
				style={{ backgroundColor: 'transparent', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
			>
				{options.map((option, index) => (
					<option className="bg-white text-gray-800 dark:bg-gray-700 dark:text-white" key={index} value={option.value}>
						{option.label}
					</option>
				))}
			</Select>
		</div>
	);
}
export default connectField<CustomFormFieldProps>(CustomSelectField);
