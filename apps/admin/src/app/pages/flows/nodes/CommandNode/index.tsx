// CommandNode.js
import { Icons } from '@mezon/ui';
import { Handle, Position } from '@xyflow/react';
import Ajv, { JSONSchemaType } from 'ajv';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoForm, SubmitField } from 'uniforms-semantic';
import CustomTextField from '../../../../components/InputField/CustomTextField';

type FormData = {
	commandName: string;
	commandCode: string;
};

interface CommandNodeProps {
	data: {
		label: string;
		id: string;
	};
	onDelete: (id: string) => void;
	onCopy: (id: string) => void;
}

const CommandNode = ({ data, onCopy, onDelete }: CommandNodeProps) => {
	const schema: JSONSchemaType<FormData> = {
		title: 'Guest',
		type: 'object',
		properties: {
			commandName: { type: 'string', uniforms: { component: CustomTextField, label: 'Command Name', name: 'commandName' } },
			commandCode: { type: 'string', uniforms: { component: CustomTextField, label: 'Command Code', name: 'commandCode' } }
		},
		required: ['commandName', 'commandCode']
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
				<span className="ml-2 font-medium flex items-center">Command Input</span>
			</div>
			<div className="mt-1">
				<div className="font-medium  bg-gray-100 dark:bg-gray-700 text-center p-2 ">Inputs</div>
				<div className="p-2">
					<div className="flex">
						<span className="text-sm">example input 1 </span>
						<span className="text-red-600 ml-2">*</span>
					</div>
					<div className="flex mt-2">
						<span className="text-sm">example input 2 </span>
						<span className="text-red-600 ml-2">*</span>
					</div>
					<AutoForm schema={bridge} onSubmit={() => console.log('submit')}>
						<CustomTextField name="commandName" label="Command Name" />
						<CustomTextField name="commandCode" label="Command Code" />
						<SubmitField className="!hidden" />
					</AutoForm>
				</div>
			</div>
			<div className="mt-1">
				<div className="font-medium  bg-gray-100 dark:bg-gray-700 text-center p-2 ">Outputs</div>
				<div className="p-2">
					<div className="flex justify-end">
						<span className="text-sm">ComandOutput</span>
					</div>
				</div>
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
				type="source"
				id="input-1"
				position={Position.Left}
				className="group-hover:bg-blue-300 bg-gray-700 absolute top-[110px] w-[10px] h-[10px]"
			/>
			<Handle
				type="source"
				id="input-2"
				position={Position.Left}
				className="group-hover:bg-blue-300 bg-gray-700 absolute top-[140px] w-[10px] h-[10px]"
			/>
			<Handle
				type="target"
				id="output"
				position={Position.Right}
				className="group-hover:bg-blue-300 bg-gray-700 absolute top-auto bottom-[12px] w-[10px] h-[10px]"
			/>
		</div>
	);
};

export default CommandNode;
