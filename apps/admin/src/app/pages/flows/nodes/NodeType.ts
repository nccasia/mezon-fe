import * as yup from 'yup';
import CodeEditorField from '../../../components/InputField/CodeEditorField';
import CustomParamsField from '../../../components/InputField/CustomParamsField';
import CustomSelectField from '../../../components/InputField/CustomSelectField';
import CustomTagsField from '../../../components/InputField/CustomTagsField';
import CustomTextField from '../../../components/InputField/CustomTextField';
import MultiImageUploadField from '../../../components/MultiImageUploadField';

// list of node types with their schema, bridge schema, and anchors. This is used to render the node in the flow editor
// add more node types in this list
const NodeTypes = [
	{
		type: 'commandInput',
		label: 'Command Input',
		schema: yup.object().shape({
			commandName: yup
				.string()
				.required('Command Name is required')
				.test('starts-with-asterisk', 'Command Name must start with an asterisk (*)', (value) => !!value && value.startsWith('*'))
				.test('not-have-space', 'Command Name must not have space', (value) => !!value && !value?.trim()?.includes(' ')),
			options: yup.array().nullable()
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				commandName: {
					type: 'string',
					uniforms: { component: CustomTextField, label: 'Command Name', name: 'commandName', placeholder: 'Enter command input' }
				},
				options: {
					type: 'string',
					uniforms: { component: CustomTagsField, label: 'Options', name: 'options', placeholder: 'Enter more options' }
				}
			},
			required: ['commandName']
		},
		anchors: {
			source: [{ id: 'command-input-source-1', text: 'Command Output' }],
			target: []
		},
		initialValue: {
			commandName: '*',
			options: []
		}
	},
	{
		type: 'uploadedImage',
		label: 'Command Output',
		schema: yup.object().shape({
			message: yup.string(),
			image: yup.array().nullable()
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					uniforms: { component: CustomTextField, label: 'Message', name: 'message', placeholder: 'Enter message' }
				},
				image: { type: 'string', uniforms: { component: MultiImageUploadField, label: 'Uploaded Image', name: 'image' } }
			},
			required: []
		},
		anchors: {
			source: [],
			target: [{ id: 'command-output-target-1', text: 'Command Input' }]
		},
		initialValue: {
			message: '',
			image: []
		}
	},
	{
		type: 'commandOutput',
		label: 'Command Output',
		schema: yup.object().shape({
			message: yup.string(),
			image: yup.array().nullable()
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					uniforms: { component: CustomTextField, label: 'Message', name: 'message', placeholder: 'Enter message' }
				},
				image: { type: 'string', uniforms: { component: MultiImageUploadField, label: 'Uploaded Image', name: 'image' } }
			},
			required: []
		},
		anchors: {
			source: [],
			target: [{ id: 'command-output-target-1', text: 'Command Input' }]
		},
		initialValue: {
			message: '',
			image: []
		}
	},
	{
		type: 'apiLoader',
		label: 'API Loader',
		schema: yup.object().shape({
			url: yup.string().required('Url is required'),
			method: yup.string().required('Method is required').oneOf(['GET', 'POST'], 'Method must be either GET or POST'),
			defaultOptions: yup.object().nullable()
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				url: { type: 'string', uniforms: { component: CustomTextField, label: 'Api Url', name: 'url' } },
				method: {
					type: 'string',
					uniforms: {
						component: CustomSelectField,
						label: 'Method (GET | POST)',
						name: 'method',
						defaultValue: 'GET',
						options: [
							{ label: 'GET', value: 'GET' },
							{ label: 'POST', value: 'POST' }
						]
					}
				},
				defaultOptions: {
					type: 'object',
					uniforms: { component: CustomParamsField, label: 'Default Options', placeholder: 'Add default options', name: 'defaultOptions' }
				}
			},
			required: []
		},
		anchors: {
			source: [{ id: 'api-loader-source-1', text: 'Custom JS Function' }],
			target: [{ id: 'api-loader-target-1', text: 'Splitter Text' }]
		},
		initialValue: {
			url: '',
			method: 'GET'
		}
	},
	{
		type: 'formatFunction',
		label: 'Custom JS Function',
		schema: yup.object().shape({
			variable: yup.string(),
			functionName: yup.string().required('Function Name is required'),
			functionBody: yup.string().required('Function Body is required')
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				functionName: { type: 'string', uniforms: { component: CustomTextField, label: 'Function Name', name: 'functionName' } },
				variable: { type: 'string', uniforms: { component: CustomTextField, label: 'Variable', name: 'variable' } },
				functionBody: { type: 'string', uniforms: { component: CodeEditorField, label: 'Function Body', name: 'functionBody' } }
			},
			required: []
		},
		anchors: {
			source: [],
			target: [{ id: 'format-function-target-1', text: 'Api Loader' }]
		},
		initialValue: {
			functionName: '',
			variable: '',
			functionBody: ''
		}
	}
];
export default NodeTypes;
// AIzaSyBWtaAws4vSpYdPs-_jOKky7sbzB5Zox2E
