import * as yup from 'yup';
import ImageUploadField from '../../../components/ImageUploadField';
import CodeEditorField from '../../../components/InputField/CodeEditorField';
import CustomTextField from '../../../components/InputField/CustomTextField';

const NodeTypes = [
	{
		type: 'commandInput',
		label: 'Command Input',
		schema: yup.object().shape({
			commandName: yup.string().required('Command Name is required')
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				commandName: { type: 'string', uniforms: { component: CustomTextField, label: 'Command Name', name: 'commandName' } }
			},
			required: ['commandName']
		},
		anchors: {
			source: [{ id: 'command-input-source-1', text: 'Command Output' }],
			target: []
		}
	},
	{
		type: 'uploadedImage',
		label: 'Command Output',
		schema: yup.object().shape({
			message: yup.string(),
			image: yup.array()
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				message: { type: 'string', uniforms: { component: CustomTextField, label: 'Message', name: 'message' } },
				image: { type: 'string', uniforms: { component: ImageUploadField, label: 'Uploaded Image', name: 'image' } }
			},
			required: []
		},
		anchors: {
			source: [],
			target: [{ id: 'command-input-target-1', text: 'Command Input' }]
		}
	},
	{
		type: 'apiLoader',
		label: 'API Loader',
		schema: yup.object().shape({
			url: yup.string().required('Url is required'),
			method: yup.string().required('Method is required')
		}),
		bridgeSchema: {
			type: 'object',
			properties: {
				url: { type: 'string', uniforms: { component: CustomTextField, label: 'Api Url', name: 'url' } },
				method: { type: 'string', uniforms: { component: CustomTextField, label: 'Method', name: 'method' } }
			},
			required: []
		},
		anchors: {
			source: [{ id: 'api-loader-source-1', text: 'Format Function' }],
			target: [{ id: 'api-loader-target-1', text: 'Splitter Text' }]
		}
	},
	{
		type: 'formatFunction',
		label: 'Format Function',
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
			target: [{ id: 'format-function-target-1', text: 'Api Loader' }]
		}
	}
];
export default NodeTypes;
