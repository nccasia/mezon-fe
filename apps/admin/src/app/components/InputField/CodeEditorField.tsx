import { javascript } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';
import { connectField, HTMLFieldProps } from 'uniforms';
type CustomFormFieldProps = HTMLFieldProps<string, HTMLDivElement> & {
	label?: string;
};

function CodeEditorField({ onChange, value, label, ...props }: CustomFormFieldProps) {
	return (
		<div className="ImageField mt-2">
			{label && <label className="block text-sm">{label}</label>}
			<CodeMirror
				{...props}
				value={value || ''}
				extensions={[javascript()]}
				onChange={(value: string) => onChange(value)}
				width={'100%'}
				height="200px"
				ref={undefined}
			/>
		</div>
	);
}
export default connectField<CustomFormFieldProps>(CodeEditorField);
