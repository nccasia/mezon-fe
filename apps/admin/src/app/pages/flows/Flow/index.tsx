import { useAuth } from '@mezon/core';
import { Icons } from '@mezon/ui';
import {
	Background,
	BackgroundVariant,
	Connection,
	Controls,
	Edge,
	EdgeChange,
	NodeChange,
	Panel,
	ReactFlow,
	useEdgesState,
	useNodesState,
	useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Popover } from 'flowbite-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FlowContext } from '../../../context/FlowContext';
import flowService from '../../../services/flowService';
import { addEdge, addNode, deleteNode, setEdgesContext, setNodesContext } from '../../../stores/flowStore/flowActions';
import { IEdge, IFlowDataRequest, IFlowDetail, INode, INodeType, IParameter } from '../../../types/flowTypes';
import AddNodeMenuPopup from '../AddNodeMenuPopup';
import FlowChatPopup from '../FlowChat';
import CustomNode from '../nodes/CustomNode';
import NodeTypes from '../nodes/NodeType';
import SaveFlowModal from './SaveFlowModal';

const Flow = () => {
	const { flowState, flowDispatch } = React.useContext(FlowContext);
	const { flowId, applicationId } = useParams();
	const { userProfile } = useAuth();
	const navigate = useNavigate();
	const reactFlowWrapper = useRef(null);
	const [openModalSaveFlow, setOpenModalSaveFlow] = React.useState(false);
	const [nodes, setNodes, onNodesChange] = useNodesState(flowState.nodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(flowState.edges);
	const { screenToFlowPosition } = useReactFlow();
	const nodeRefs = useRef<{ [key: string]: HTMLElement | null }>({} as { [key: string]: HTMLElement });
	const [flowData, setFlowData] = React.useState<{ flowName: string; description: string }>({
		flowName: 'Untitle Flow',
		description: ''
	});
	useEffect(() => {
		setNodes(flowState.nodes);
	}, [flowState.nodes, setNodes]);
	useEffect(() => {
		console.log('edges', flowState.edges);
		setEdges(flowState.edges);
	}, [flowState.edges, setEdges]);

	// handle drag, drop and connect nodes
	const onConnect = useCallback(
		(params: Connection) => {
			console.log(params);
			flowDispatch(addEdge(params as Edge));
		},
		[flowDispatch]
	);
	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const listNodeType = useMemo(() => {
		const obj: { [key: string]: (props: any) => JSX.Element } = {};
		NodeTypes.forEach((item, index) => {
			if (!obj[item.type]) {
				obj[item.type] = (props) => {
					console.log('props', props);
					return (
						<CustomNode
							{...props}
							schema={item.schema}
							label={item.label}
							bridgeSchema={item.bridgeSchema}
							anchors={item.anchors}
							ref={(el: HTMLElement | null) => {
								if (el) {
									nodeRefs.current[props.data.id] = el;
								} else {
									delete nodeRefs.current[props.data.id]; // Xóa ref khi node bị xóa
								}
							}}
						/>
					);
				};
			}
		});
		return obj;
	}, []);

	const onChangeNode = (changes: NodeChange[]) => {
		onNodesChange(changes);
		flowDispatch(setNodesContext(nodes));
	};
	const onChangeEdge = (changes: EdgeChange[]) => {
		onEdgesChange(changes);
		flowDispatch(setEdgesContext(edges));
	};
	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			const position = screenToFlowPosition({
				x: event.clientX + 50,
				y: event.clientY + 50
			});
			console.log(position);
			flowDispatch(addNode(position));
		},
		[screenToFlowPosition, flowDispatch]
	);

	const handleClickBackButton = () => {
		// reset flow data when click back button
		flowDispatch(setNodesContext([]));
		flowDispatch(setEdgesContext([]));
		navigate(-1);
	};

	const handleClickSaveFlow = async () => {
		let checkValidate = true;
		// get data from all nodes
		const formData: {
			[key: string]: {
				[key: string]: string;
			};
		} = Object.keys(nodeRefs.current).reduce(
			(data, nodeId) => {
				const nodeRef = nodeRefs.current[nodeId] as {
					getFormData?: () => {
						[key: string]: string;
					};
					checkValidate?: () => {
						[key: string]: string;
					};
				};
				data[nodeId] = nodeRef?.getFormData?.() ?? {};
				// check validate of all nodes
				const check = nodeRef?.checkValidate?.();
				if (!check) checkValidate = false;
				return data;
			},
			{} as {
				[key: string]: {
					[key: string]: string;
				};
			}
		);

		// check validate of all nodes, if one node is invalid, return
		if (!checkValidate) return;
		const listNodeInFlow: INode[] = [];
		nodes.forEach((node) => {
			const parameters = Object.keys(formData[node.id] ?? {}).map((key) => ({
				parameterKey: key,
				parameterValue: formData[node.id][key]
			}));
			const newNode: INode = {
				id: node.id,
				nodeType: node.type as INodeType,
				nodeName: node.type as INodeType,
				position: node.position,
				measured: { width: node.measured?.width ?? 0, height: node.measured?.height ?? 0 },
				parameters,
				data: {
					id: node.id ?? ''
				},
				selected: node.selected ?? false
			};
			listNodeInFlow.push(newNode);
		});
		const listEdgeInFlow: IEdge[] = [];
		edges.forEach((edge: Edge) => {
			const newEdge = {
				id: edge.id,
				sourceNodeId: edge.source,
				targetNodeId: edge.target,
				sourceHandleId: edge.sourceHandle ?? '',
				targetHandleId: edge.targetHandle ?? ''
			};
			listEdgeInFlow.push(newEdge);
		});

		if (!userProfile?.user?.id) {
			toast.error('User not found');
			return;
		}
		if (!flowData?.flowName) {
			toast.error('Flow name is required');
			return;
		}

		const flowDataSave: IFlowDataRequest = {
			userId: userProfile?.user?.id,
			flowName: flowData?.flowName,
			description: flowData?.description,
			isActive: true,
			connections: listEdgeInFlow,
			nodes: listNodeInFlow
		};

		try {
			if (flowId) {
				toast.info('Api update flow is updating');
				// const response = await flowService.updateFlow({ ...flowDataSave, flowId });
				// console.log(response);
				// toast.success('Update flow success');
				// call api update flow
			} else {
				const response = await flowService.createNewFlow(flowDataSave);
				toast.success('Save flow success');
				// navigate to flow detail after create flow
				navigate(`/applications/${applicationId}/flow/${response.id}`);
			}
		} catch (error) {
			toast.error('Save flow failed');
		}
	};
	useEffect(() => {
		// set flow data is empty when flowId is empty
		if (!flowId) {
			flowDispatch(setNodesContext([]));
			flowDispatch(setEdgesContext([]));
			return;
		}

		// get flow detail when flowId is not empty
		const getDetailFlow = async () => {
			const response: IFlowDetail = await flowService.getFlowDetail(flowId);
			setFlowData({
				flowName: response?.flowName,
				description: response?.description
			});
			const listNode = response.nodes?.map((node: INode) => {
				const params: {
					[key: string]: string;
				} = {};
				node?.parameters?.forEach((param: IParameter) => {
					params[param.parameterKey] = param.parameterValue;
				});
				return {
					id: node.id,
					type: node.nodeType,
					nodeName: node.nodeName,
					measured: typeof node.measured === 'string' ? JSON.parse(node.measured) : node.measured,
					position: typeof node.position === 'string' ? JSON.parse(node.position) : node.position,
					data: {
						label: node.nodeName,
						id: node.id,
						defaultValue: params
					}
				};
			});
			flowDispatch(setNodesContext(listNode));
			const listEdge: Edge[] = response.connections?.map((edge: IEdge) => {
				return {
					id: edge.id ?? '',
					source: edge.sourceNodeId,
					target: edge.targetNodeId,
					sourceHandle: edge.sourceHandleId ?? '',
					targetHandle: edge.targetHandleId ?? ''
				};
			});
			flowDispatch(setEdgesContext(listEdge));
		};
		getDetailFlow();
	}, [flowId, flowDispatch]);
	useEffect(() => {
		// handle delete node when press delete key
		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'Delete') {
				const selectedNodes = document.querySelectorAll('.selected');
				if (selectedNodes.length) {
					selectedNodes.forEach((node) => {
						const nodeId = node.id;
						flowDispatch(deleteNode(nodeId));
					});
				}
			}
		};
		document.addEventListener('keyup', onKeyUp);
		return () => {
			document.removeEventListener('keyup', onKeyUp);
		};
	}, [nodes, edges, flowDispatch]);

	return (
		<div
			ref={reactFlowWrapper}
			className={'border-gray-200 border-[1px] w-full transition-all fixed top-0 left-0 right-0 bottom-0 z-50 h-[calc(100vh-50px)]'}
		>
			<div className="px-4">
				<div className="top-2 left-3 right-3 z-10 bg-gray-50 dark:bg-gray-400 h-[50px] flex items-center justify-between px-3 my-2 rounded-full">
					<div className="flex items-center gap-2">
						<button
							onClick={handleClickBackButton}
							className="w-[40px] h-[40px] ml-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-600 dark:bg-blue-500 border-[1px] transition-all active:bg-blue-200"
						>
							<Icons.LeftArrowIcon className="w-full" />
						</button>
						<div className="flex items-center text-[24px] font-semibold ml-[20px] pl-[10px] border-l-[1px] border-l-gray-300">
							<span>{flowData?.flowName ?? 'Untitle Flow'}</span>
							<button
								onClick={() => setOpenModalSaveFlow(true)}
								className="ml-3 w-[30px] h-[30px] flex items-center justify-center border-[1px] border-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
							>
								<Icons.PenEdit />
							</button>
						</div>
					</div>
					<div className="rightbox flex items-center gap-2">
						<button
							onClick={handleClickSaveFlow}
							className="w-[40px] h-[40px] mr-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-600 dark:bg-blue-500 border-[1px] transition-all active:bg-blue-200"
						>
							<Icons.IconTick />
						</button>
						<button className="w-[40px] h-[40px] mr-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-600 dark:bg-blue-500 border-[1px] transition-all active:bg-blue-200">
							<Icons.DeleteMessageRightClick />
						</button>
					</div>
				</div>
			</div>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={listNodeType}
				onNodesChange={onChangeNode}
				onEdgesChange={onChangeEdge}
				onConnect={onConnect}
				onDrop={onDrop}
				onDragOver={onDragOver}
				minZoom={0.5}
				maxZoom={3}
				defaultViewport={{ x: 100, y: 100, zoom: 1 }}
				// fitView
				colorMode="light"
			>
				<Panel position="top-left">
					<Popover content={<AddNodeMenuPopup />} trigger="click">
						<button className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md">
							<Icons.AddIcon className="w-6 h-6" />
						</button>
					</Popover>
				</Panel>
				<Panel position="top-right">
					<Popover content={<FlowChatPopup />} trigger="click">
						<button className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md">
							<Icons.IconChat className="w-6 h-6" />
						</button>
					</Popover>
				</Panel>
				<Controls />
				<Background className="dark:bg-bgPrimary bg-bgLightPrimary text-gray-500 dark:text-gray-100" variant={BackgroundVariant.Dots} />
			</ReactFlow>

			<SaveFlowModal
				flowData={flowData}
				changeFlowData={setFlowData}
				title="Save Flow"
				open={openModalSaveFlow}
				onClose={() => setOpenModalSaveFlow(false)}
			/>
		</div>
	);
};
export default Flow;
