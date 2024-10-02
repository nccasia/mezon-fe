import { Icons } from '@mezon/ui';
import { Handle, Position } from '@xyflow/react';
import { changeOpenModalNodeDetail, changeSelectedNode, copyNode, deleteNode } from '../../../../stores/flow/flow.action';

import React, { useContext, useRef } from 'react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoForm } from 'uniforms-semantic';
import * as yup from 'yup';

import { FlowContext } from '../../../../context/FlowContext';
import { ISelectedNode } from '../../../../stores/flow/flow.interface';

interface IAnchor {
	id: string;
	text: string;
}

interface CustomNodeProps {
	data: {
		label: string;
		type: string;
		id: string;
		defaultValue: {
			[key: string]: string;
		};
	};
	label: string;
	schema: yup.ObjectSchema<Record<string, unknown>>;
	bridgeSchema: {
		type: string;
		properties: Record<string, { type: string; uniforms: { component: React.ComponentType; label: string; name: string } }>;
		required: string[];
	};
	anchors: {
		source: IAnchor[];
		target: IAnchor[];
	};
}
interface ValidationError {
	path: string;
	message: string;
}
interface ValidatorResult {
	details: ValidationError[];
}

const CustomNode = React.forwardRef(({ data, schema, bridgeSchema, anchors, label }: CustomNodeProps, ref) => {
	const { flowDispatch } = useContext(FlowContext);
	const validator = (model: unknown): ValidatorResult | null => {
		try {
			schema.validateSync(model, { abortEarly: false });
			return null; // no error
		} catch (e: unknown) {
			if (e instanceof yup.ValidationError) {
				// return list error of yup validation
				const details = e.inner.map((error) => ({
					path: error.path ?? '',
					message: error.message
				}));
				return { details };
			}
			return null;
		}
	};

	const bridge = new JSONSchemaBridge({
		schema: bridgeSchema,
		validator
	});

	const formRef = useRef<any>(null);
	React.useImperativeHandle(ref, () => ({
		getFormData: () => {
			return formRef.current?.getModel();
		},
		checkValidate: () => {
			const model = formRef.current?.getModel();
			const validationResult = validator(model);
			formRef.current?.submit();

			return validationResult ? false : true;
		}
	}));

	const handleDeleteNode = (e: React.MouseEvent<HTMLButtonElement>, nodeId: string) => {
		e.stopPropagation();
		flowDispatch(deleteNode(nodeId));
	};
	const handleCopyNode = (e: React.MouseEvent<HTMLButtonElement>, nodeId: string) => {
		e.stopPropagation();
		const defaultValue = formRef.current?.getModel();
		flowDispatch(copyNode(nodeId, defaultValue));
	};
	const handleShowDetail = (e: React.MouseEvent<HTMLButtonElement>, nodeId: string) => {
		const parameters = [];
		for (const schema in bridgeSchema.properties) {
			parameters.push({
				name: schema,
				type: bridgeSchema.properties[schema].type,
				label: bridgeSchema.properties[schema].uniforms.label
			});
		}
		const nodeData: ISelectedNode = {
			type: data.type,
			label: label,
			description: '',
			parameters
		};
		flowDispatch(changeSelectedNode(nodeData));
		flowDispatch(changeOpenModalNodeDetail(true));
		e.stopPropagation();
	};

	return (
		<div className="w-[250px] border-2 rounded-lg bg-slate-50 dark:bg-gray-600 relative group hover:border-blue-300">
			<div className="p-2 flex">
				<span className="ml-2 font-medium flex items-center">{label}</span>
			</div>
			<div className="mt-1">
				<div className="font-medium bg-gray-100 dark:bg-gray-700 text-center p-2">Inputs</div>
				<div className="p-2 hidden-submit-field">
					{/* render text label of target anchors */}
					{anchors.target?.map((item, index) => {
						return (
							<div key={index} className="flex mt-1">
								<span className="text-sm">{item.text}</span>
								<span className="text-red-600 ml-2">*</span>
							</div>
						);
					})}
					<AutoForm model={data.defaultValue} ref={formRef} schema={bridge}></AutoForm>
				</div>
			</div>
			<div className="mt-1">
				<div className="font-medium bg-gray-100 dark:bg-gray-700 text-center p-2">Outputs</div>
				<div className="p-2">
					{/* render text label of source anchors */}
					{anchors.source?.map((item, index) => {
						return (
							<div key={index} className="flex justify-end">
								<span className="text-sm">{item.text}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Node actions */}
			<div className="absolute top-0 right-[-60px] rounded-md flex-col gap-[10px] shadow-lg p-2 bg-slate-50 dark:bg-gray-600 hidden group-hover:flex">
				<div className="bg-transparent absolute left-[-50px] w-[50px] h-[100px]"></div>
				<button onClick={(e) => handleCopyNode(e, data.id)} className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md">
					<Icons.CopyIcon />
				</button>
				<button onClick={(e) => handleDeleteNode(e, data.id)} className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md text-sm">
					<Icons.DeleteMessageRightClick />
				</button>
				<button onClick={(e) => handleShowDetail(e, data.id)} className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md">
					<Icons.EyeOpen />
				</button>
			</div>

			{/* Render all source anchors */}
			{anchors.source?.map((item, index) => {
				return (
					<Handle
						key={index}
						type={'source'}
						id={item.id}
						position={Position.Right}
						className={`group-hover:bg-blue-300 bg-gray-700 absolute w-[10px] h-[10px] top-auto`}
						style={{ bottom: `${12 + index * 20}px` }}
					/>
				);
			})}
			{/* Render all target anchors */}
			{anchors.target?.map((item, index) => {
				return (
					<Handle
						key={index}
						type={'target'}
						id={item.id}
						position={Position.Left}
						className={`group-hover:bg-blue-300 bg-gray-700 absolute w-[10px] h-[10px]`}
						style={{ top: `${105 + 30 * index}px` }}
					/>
				);
			})}
		</div>
	);
});

export default CustomNode;
