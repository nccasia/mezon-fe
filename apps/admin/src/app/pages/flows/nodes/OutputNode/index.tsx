// CommandOutputNode.js
import { Icons } from '@mezon/ui';
import { Handle, Position } from '@xyflow/react';
import Ajv, { JSONSchemaType } from 'ajv';
import React, { useRef } from 'react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoForm, SubmitField } from 'uniforms-semantic';
import ImageUploadField from '../../../../components/ImageUploadField';
import CustomTextField from '../../../../components/InputField/CustomTextField';

type FormData = {
	commandName: string;
};

interface CommandOutputNodeProps {
	data: {
		label: string;
		id: string;
	};
	onDelete: (id: string) => void;
	onCopy: (id: string) => void;
}

const CommandOutputNode = React.forwardRef(({ data, onCopy, onDelete }: CommandOutputNodeProps, ref) => {
	const schema: JSONSchemaType<FormData> = {
		title: 'Guest',
		type: 'object',
		properties: {
			commandName: { type: 'string', uniforms: { component: CustomTextField, label: 'Command Name', name: 'commandName' } },
			uploadedImage: { type: 'string', uniforms: { component: ImageUploadField } }
		},
		required: ['commandName']
	};

	const ajv = new Ajv({
		allErrors: true,
		useDefaults: true,
		keywords: ['uniforms']
	});

	function createValidator<T>(schema: JSONSchemaType<T>) {
		const validator = ajv.compile(schema);

		return (model: Record<string, unknown>) => {
			validator(model);
			return validator.errors?.length ? { details: validator.errors } : null;
		};
	}

	const schemaValidator = createValidator(schema);

	const bridge = new JSONSchemaBridge({
		schema,
		validator: schemaValidator
	});
	const formRef = useRef(null);
	React.useImperativeHandle(ref, () => ({
		getFormData: () => {
			return (formRef.current as any)?.getModel(); // Trả về dữ liệu form khi cần
		}
	}));

	return (
		<div className="w-[250px] border-2 rounded-lg bg-slate-50 dark:bg-gray-600 relative group hover:border-blue-300">
			<div className="p-2 flex">
				<div className="w-[30px] h-[30px] bg-gray-200 rounded-full items-center">
					<img
						src="https://static.vecteezy.com/system/resources/previews/022/095/996/non_2x/command-button-icon-isolated-on-white-background-vector.jpg"
						alt=""
						className="w-[30px] h-[30px] rounded-full"
					/>
				</div>
				<span className="ml-2 font-medium flex items-center">Command Output</span>
			</div>
			<div className="mt-1">
				<div className="font-medium  bg-gray-100 dark:bg-gray-700 text-center p-2 ">Inputs</div>
				<div className="p-2 flex flex-col gap-1">
					<div className="flex ">
						<span className="text-sm">Command Input </span>
						<span className="text-red-600 ml-2">*</span>
					</div>
					<AutoForm ref={formRef} schema={bridge} onSubmit={() => console.log('submit')}>
						<CustomTextField name="commandName" label="Command Name" />
						<ImageUploadField name="uploadedImage" />
						<SubmitField className="!hidden" />
					</AutoForm>
				</div>
			</div>
			<div className="mt-1">
				<div className="font-medium  bg-gray-100 dark:bg-gray-700 text-center p-2 ">Outputs</div>
				<div className="p-2"></div>
			</div>

			{/* Node actions */}
			<div className="absolute top-0 right-[-60px] rounded-md flex-col gap-[10px] shadow-lg p-2  bg-slate-50 dark:bg-gray-600 hidden group-hover:flex">
				<div className="bg-transparent absolute left-[-50px] w-[50px] h-[100px]"></div>
				<button onClick={() => onCopy(data.id)} className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md">
					<Icons.CopyIcon />
				</button>
				<button onClick={() => onDelete(data.id)} className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md text-sm">
					<Icons.DeleteMessageRightClick />
				</button>
				<button className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md">
					<Icons.EyeOpen />
				</button>
			</div>
			{/* node connect endpoint */}
			<Handle
				type="target"
				id="input-1"
				position={Position.Left}
				className="group-hover:bg-blue-300 bg-gray-700 absolute top-[110px] w-[10px] h-[10px]"
			/>
		</div>
	);
});

export default CommandOutputNode;
