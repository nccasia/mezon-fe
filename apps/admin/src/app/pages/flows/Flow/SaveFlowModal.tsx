import { Modal } from '@mezon/ui';
import Ajv, { JSONSchemaType } from 'ajv';
import { useRef } from 'react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoForm, SubmitField } from 'uniforms-semantic';
import CustomTextField from '../../../components/InputField/CustomTextField';

type FormData = {
	flowName: string;
	description: string;
};

const schema: JSONSchemaType<FormData> = {
	title: 'Guest',
	type: 'object',
	properties: {
		flowName: { type: 'string', uniforms: { component: CustomTextField, label: 'Flow Name', name: 'flowName' } },
		description: { type: 'string', uniforms: { component: CustomTextField, label: 'Description', name: 'description' } }
	},
	required: ['flowName', 'description']
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

interface SaveFlowModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	changeFlowData?: (data: FormData) => void;
	flowData?: FormData;
}
const SaveFlowModal = ({ open, onClose, title, changeFlowData, flowData }: SaveFlowModalProps) => {
	const submitBtnRef = useRef<any>(null);
	const confirmSave = () => {
		const data = submitBtnRef.current?.getModel();
		changeFlowData?.(data);
	};
	return (
		<Modal confirmButton={confirmSave} titleConfirm="Save" title={title} showModal={open} onClose={onClose}>
			<div className="p-4">
				<AutoForm model={flowData} ref={submitBtnRef} schema={bridge}>
					<CustomTextField name="flowName" label="Flow Name" />
					<CustomTextField name="description" label="Description" />
					<SubmitField className="!hidden" />
				</AutoForm>
			</div>
		</Modal>
	);
};
export default SaveFlowModal;
