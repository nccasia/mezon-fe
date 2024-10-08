import { useAuth } from '@mezon/core';
import { selectAppDetail } from '@mezon/store';
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
import { Popover, Tooltip } from 'flowbite-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FlowContext } from '../../../context/FlowContext';
import flowService from '../../../services/flowService';
import { addEdge, addNode, deleteNode, setEdgesContext, setNodesContext } from '../../../stores/flow/flow.action';
import { IEdge, IFlowDataRequest, IFlowDetail, INode, INodeType, IParameter } from '../../../stores/flow/flow.interface';
import AddNodeMenuPopup from '../AddNodeMenuPopup';
import ExampleFlow from '../ExampleFlows';
import FlowChatPopup from '../FlowChat';
import CustomNode from '../nodes/CustomNode';
import NodeTypes from '../nodes/NodeType';
import ConfirmDeleteFlowPopup from './ConfirmDeleteFlowPopup';
import NodeDetailModal from './NodeDetailModal';
import SaveFlowModal from './SaveFlowModal';

const Flow = () => {
	const { flowState, flowDispatch } = React.useContext(FlowContext);
	const { flowId, applicationId } = useParams();
	const { userProfile } = useAuth();
	const navigate = useNavigate();
	const reactFlowWrapper = useRef(null);
	const [openModalSaveFlow, setOpenModalSaveFlow] = React.useState(false);
	const [isExampleFlow, setIsExampleFlow] = React.useState(true);
	const [nodes, setNodes, onNodesChange] = useNodesState(flowState.nodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(flowState.edges);
	const { screenToFlowPosition } = useReactFlow();
	const appDetail = useSelector(selectAppDetail);
	const nodeRefs = useRef<{ [key: string]: HTMLElement | null }>({} as { [key: string]: HTMLElement });
	const [flowData, setFlowData] = React.useState<{ flowName: string; description: string }>({
		flowName: 'Untitled Flow',
		description: ''
	});
	useEffect(() => {
		setNodes(flowState.nodes);
	}, [flowState.nodes, setNodes]);
	useEffect(() => {
		setEdges(flowState.edges);
	}, [flowState.edges, setEdges]);

	// handle drag, drop and connect nodes
	const onConnect = useCallback(
		(params: Connection) => {
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
			flowDispatch(addNode(position));
		},
		[screenToFlowPosition, flowDispatch]
	);

	const handleClickBackButton = () => {
		// reset flow data when click back button
		flowDispatch(setNodesContext([]));
		flowDispatch(setEdgesContext([]));
		navigate(`/applications/${applicationId}/flow`);
	};
	const handleClickDeleteButton = async () => {
		if (!flowId) {
			toast.info('Flow has not been created yet');
			return;
		}
		try {
			await flowService.deleteFlow(flowId);
			toast.success('Delete flow success');
			navigate(`/applications/${applicationId}/flow`);
		} catch {
			toast.error('Delete flow failed');
		}
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
			const parameters = Object.keys(formData[node.id] ?? {}).map((key) => {
				let value = formData[node.id][key];
				if (typeof value !== 'string') {
					value = JSON.stringify(value);
				}
				return {
					parameterKey: key,
					parameterValue: value
				};
			});
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
		// loop through all edges to get connection
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
			referralId: userProfile?.user?.id,
			applicationId: applicationId ?? '',
			applicationToken: appDetail?.token ?? '',
			// applicationId: '1842062828475781120',
			// applicationToken: '4b3152783648644e4358534f54387131',
			username: userProfile?.user?.username ?? '',
			flowName: flowData?.flowName,
			description: flowData?.description,
			isActive: true,
			connections: listEdgeInFlow,
			nodes: listNodeInFlow
		};

		if (!flowDataSave.nodes.length) {
			toast.error('Flow must have at least one node');
			return;
		}
		if (!flowDataSave.connections.length) {
			toast.error('Flow must have at least one connection');
			return;
		}

		try {
			if (flowId) {
				// toast.info('Api update flow is updating');
				await flowService.updateFlow({ ...flowDataSave, flowId });
				toast.success('Update flow success');
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
			setIsExampleFlow(false);
			return;
		}

		const checkIsExampleFlow = ExampleFlow.find((item) => item.id === flowId);

		const setFlowDetail = (flowDetail: IFlowDetail) => {
			setFlowData({
				flowName: flowDetail?.flowName,
				description: flowDetail?.description
			});
			const listNode = flowDetail.nodes?.map((node: INode) => {
				const params: {
					[key: string]: string;
				} = {};
				node?.parameters?.forEach((param: IParameter) => {
					let value = param.parameterValue;
					try {
						value = JSON.parse(param.parameterValue);
					} catch {
						value = param.parameterValue;
					}
					params[param.parameterKey] = value;
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
			const listEdge: Edge[] = flowDetail.connections?.map((edge: IEdge) => {
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

		// get flow detail when flowId is not empty
		const getDetailFlow = async () => {
			try {
				if (checkIsExampleFlow) {
					setFlowDetail(checkIsExampleFlow.flowDetail);
					setIsExampleFlow(true);
				} else {
					const response: IFlowDetail = await flowService.getFlowDetail(flowId);
					setIsExampleFlow(false);
					setFlowDetail(response);
				}
			} catch (error) {
				toast.error('Get flow detail failed');
			}
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
		<div ref={reactFlowWrapper} className={'w-full transition-all fixed top-0 left-0 right-0 bottom-0 z-50 h-[calc(100vh-50px)]'}>
			<div className="px-4">
				<div className="top-1 left-3 right-3 z-10 bg-gray-50 dark:bg-gray-600 h-[50px] flex items-center justify-between px-3 my-1 rounded-full">
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
								className="ml-3 w-[30px] h-[30px] flex items-center justify-center border-[1px] border-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 "
							>
								<Icons.PenEdit />
							</button>
						</div>
					</div>
					<div className="rightbox flex items-center gap-2">
						<Tooltip content="Save Flow" style={'light'}>
							<button
								onClick={handleClickSaveFlow}
								disabled={isExampleFlow}
								className="w-[40px] h-[40px] mr-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-600 dark:bg-blue-500 border-[1px] transition-all active:bg-blue-200"
							>
								<Icons.IconTick />
							</button>
						</Tooltip>
						<Tooltip content="Delete Flow" style={'light'}>
							<Popover content={<ConfirmDeleteFlowPopup onConfirm={handleClickDeleteButton} />} trigger="click">
								<button
									disabled={!flowId || isExampleFlow}
									className="w-[40px] h-[40px] mr-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-600 dark:bg-blue-500 border-[1px] transition-all active:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Icons.DeleteMessageRightClick />
								</button>
							</Popover>
						</Tooltip>
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
				<Controls />
				<Background className="dark:bg-bgPrimary bg-bgLightPrimary text-gray-500 dark:text-gray-100" variant={BackgroundVariant.Dots} />
			</ReactFlow>

			<Popover content={<FlowChatPopup />} trigger="click">
				<button className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md absolute top-[80px] right-3">
					<Icons.IconChat className="w-6 h-6" />
				</button>
			</Popover>

			<SaveFlowModal
				flowData={flowData}
				changeFlowData={setFlowData}
				title="Save Flow"
				open={openModalSaveFlow}
				onClose={() => setOpenModalSaveFlow(false)}
			/>
			<NodeDetailModal />
		</div>
	);
};
export default Flow;
