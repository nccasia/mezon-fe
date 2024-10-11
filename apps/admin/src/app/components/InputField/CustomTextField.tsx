import { connectField, HTMLFieldProps } from 'uniforms';

type CustomFormFieldProps = HTMLFieldProps<string, HTMLDivElement> & {
	label?: string;
};
function CustomTextField({ onChange, value, label, errorMessage, showInlineError, fieldType, changed, ...props }: CustomFormFieldProps) {
	return (
		<div className="ImageField mt-2">
			{label && <label className="block text-sm">{label}</label>}
			<input
				className="my-1 block w-full px-3 py-2 border-[1px] focus:border-[1px] bg-transparent focus-visible:border-0 focus:ring-0 focus-visible:ring-gray-100 focus-within:ring-0 focus:ring-transparent rounded-lg"
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					onChange(event.target.value);
				}}
				value={value || ''}
				type={props.type}
				placeholder={props.placeholder}
				disabled={props.disabled}
				name={props.name}
				ref={undefined}
			/>
		</div>
	);
}
export default connectField<CustomFormFieldProps>(CustomTextField);
