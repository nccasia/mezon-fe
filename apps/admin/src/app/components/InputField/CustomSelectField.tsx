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
	defaultValue,
	options = [],
	...props
}: CustomFormFieldProps) {
	return (
		<div className="ImageField mt-2">
			{label && <label className="block text-sm">{label}</label>}
			<Select
				className=""
				onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
					onChange(event.target.value);
				}}
				value={value || ''}
				disabled={props.disabled}
				defaultValue={defaultValue}
				name={props.name}
				ref={undefined}
				required
			>
				{options.map((option, index) => (
					<option key={index} value={option.value}>
						{option.label}
					</option>
				))}
			</Select>
		</div>
	);
}
export default connectField<CustomFormFieldProps>(CustomSelectField);
