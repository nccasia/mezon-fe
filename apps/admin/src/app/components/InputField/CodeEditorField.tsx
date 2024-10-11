import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; // Optional: You can choose different themes
import Editor from 'react-simple-code-editor';

// Import the languages you need to support
import 'prismjs/components/prism-javascript';
import { connectField, HTMLFieldProps } from 'uniforms';
type CustomFormFieldProps = HTMLFieldProps<string, HTMLDivElement> & {
	label?: string;
};

function CodeEditorField({ onChange, value, label, errorMessage, showInlineError, fieldType, changed, ...props }: CustomFormFieldProps) {
	const highlight = (code: string) => Prism.highlight(code, Prism.languages.javascript, 'javascript');
	return (
		<div className="ImageField mt-2">
			{label && <label className="block text-sm">{label}</label>}
			<Editor
				// {...props}
				value={value || ''}
				className="my-1 block w-full text-[12px] px-3 py-2 border-[1px] focus:border-[1px] dark:bg-gray-600 focus:border-gray-500 focus-visible:border-0 focus:ring-0 focus-visible:ring-gray-100 focus-within:ring-0 focus:ring-transparent "
				onValueChange={(newCode) => onChange(newCode)}
				highlight={highlight}
				padding={10}
				autoCapitalize="off"
				style={{
					minHeight: '150px'
				}}
			/>
		</div>
	);
}
export default connectField<CustomFormFieldProps>(CodeEditorField);
