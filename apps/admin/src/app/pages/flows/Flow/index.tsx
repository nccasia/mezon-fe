import { useAuth } from '@mezon/core';
import { Icons } from '@mezon/ui';
import { apiInstance } from '@mezon/utils';
import {
	addEdge,
	Background,
	BackgroundVariant,
	Connection,
	Controls,
	Node,
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
import { v4 as uuidv4 } from 'uuid';
import AddNodeMenuPopup from '../AddNodeMenuPopup';
import FlowChatPopup from '../FlowChat';
import CommandNode from '../nodes/CommandNode';
import DefaultNode from '../nodes/DefaultNode';
import CommandInputNode from '../nodes/InputNode';
import CommandOutputNode from '../nodes/OutputNode';
import SaveFlowModal from './SaveFlowModal';

const initialNodes: Node[] = [
	// { id: '1', position: { x: 0, y: 0 }, data: { label: 'Command Node' }, type: 'command' },
	// { id: '2', position: { x: 300, y: 0 }, data: { label: 'Default Node' }, type: 'defaultCustom' }
];
const Flow = () => {
	const { flowId, applicationId } = useParams();
	const { userProfile } = useAuth();
	const navigate = useNavigate();
	const reactFlowWrapper = useRef(null);
	const [openModalSaveFlow, setOpenModalSaveFlow] = React.useState(false);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [nodeType, setNodeType] = React.useState('default');
	const { screenToFlowPosition } = useReactFlow();
	const nodeRefs = useRef<{ [key: string]: HTMLElement | null }>({} as { [key: string]: HTMLElement });
	const [flowData, setFlowData] = React.useState<any>({});

	// handle drag, drop and connect nodes
	const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const handleChangeNodeType = useCallback(
		(type: string) => {
			setNodeType(type);
		},
		[setNodeType]
	);

	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			// remove node in list nodes
			setNodes((nds) => nds.filter((n) => n.id !== nodeId));
			// remove edges connect to this node
			setEdges((eds) => eds.filter((e: { source: string; target: string }) => e.source !== nodeId && e.target !== nodeId));
		},
		[setNodes, setEdges]
	);

	const getId = () => {
		const nodeId = uuidv4();
		return `${nodeId}`;
		// return `${nodeType}_${nodeId}`;
	};

	const handleCopyNode = useCallback(
		(nodeId: string) => {
			setNodes((nds) => {
				const nodeToCopy = nds.find((node) => node.id === nodeId);
				if (!nodeToCopy) return nds;

				const id = getId();
				const newNode = {
					...nodeToCopy,
					id, // Tạo id mới cho node sao chép
					position: {
						x: nodeToCopy.position.x + 50, // Di chuyển vị trí node mới
						y: nodeToCopy.position.y + 50
					},
					data: {
						...nodeToCopy.data,
						id
					}
				};

				return [...nds, newNode]; // Thêm node mới vào danh sách nodes
			});
		},
		[nodes, setNodes, handleDeleteNode]
	);

	const nodeTypes = useMemo(() => {
		return {
			command: (props: any) => <CommandNode {...props} onCopy={handleCopyNode} onDelete={handleDeleteNode} />,
			commandInput: (props: any) => (
				<CommandInputNode
					{...props}
					onCopy={handleCopyNode}
					onDelete={handleDeleteNode}
					ref={(el: HTMLElement | null) => {
						if (el) {
							nodeRefs.current[props.data.id] = el;
						} else {
							delete nodeRefs.current[props.data.id]; // Xóa ref khi node bị xóa
						}
					}}
				/>
			),
			commandOutput: (props: any) => (
				<CommandOutputNode
					{...props}
					onCopy={handleCopyNode}
					onDelete={handleDeleteNode}
					ref={(el: HTMLElement | null) => {
						if (el) {
							nodeRefs.current[props.data.id] = el;
						} else {
							delete nodeRefs.current[props.data.id]; // Xóa ref khi node bị xóa
						}
					}}
				/>
			),
			defaultCustom: DefaultNode
		};
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			const position = screenToFlowPosition({
				x: event.clientX + 50,
				y: event.clientY + 50
			});
			const id = getId();
			const newNode = {
				id,
				type: nodeType,
				position,
				data: {
					label: `${nodeType}`,
					id
				}
			};

			setNodes([...nodes, newNode]);
		},
		[screenToFlowPosition, nodeType, nodes, handleDeleteNode, handleCopyNode, setNodes]
	);

	const handleClickBackButton = () => {
		navigate(-1);
	};

	const handleClickSaveFlow = async () => {
		const formData: { [key: string]: any } = Object.keys(nodeRefs.current).reduce(
			(acc, nodeId) => {
				const nodeRef = nodeRefs.current[nodeId] as { getFormData?: () => any };
				acc[nodeId] = nodeRef?.getFormData?.(); // Lấy dữ liệu form từ ref
				return acc;
			},
			{} as { [key: string]: any }
		);
		const listNodeString: any[] = [];
		nodes.forEach((node) => {
			const parameters = Object.keys(formData[node.id] ?? {}).map((key) => ({
				parameterKey: key,
				parameterValue: formData[node.id][key]
			}));
			const newNode = {
				// ...node,
				// data: {
				// 	...node.data,
				// 	id: node.id,
				// 	label: node.data.label,
				// 	type: node.type,
				// 	inputParams: [],
				// 	inputAnchors: [],
				// 	input: formData[node.id],
				// 	outputAnchors: [],
				// 	output: {},
				// 	selected: node.selected
				// }
				id: node.id,
				nodeType: node.type,
				nodeName: node.data.label,
				position: node.position,
				measured: node.measured,
				parameters
			};
			console.log(newNode);
			listNodeString.push(newNode);
		});
		const listEdgeString: any[] = [];
		edges.forEach((edge: any) => {
			const newEdge = {
				sourceNodeId: edge.source,
				targetNodeId: edge.target
			};
			listEdgeString.push(newEdge);
		});

		if (!userProfile?.user?.id) {
			toast.error('User not found');
			return;
		}
		if (!flowData?.flowName) {
			toast.error('Flow name is required');
			return;
		}

		const dataCreate = {
			userId: userProfile?.user?.id,
			flowName: flowData?.flowName,
			description: flowData?.description,
			isActive: true,
			connections: listEdgeString,
			nodes: listNodeString
		};
		console.log(dataCreate);

		try {
			if (flowId) {
				console.log('update flow');
				// call api update flow
			} else {
				const response: any = await apiInstance.post('/flow/create', dataCreate);
				console.log(response);
				toast.success('Save flow success');
				// navigate to flow detail after create flow
				navigate(`/applications/${applicationId}/flow/${response.id}`);
			}
		} catch (error) {
			toast.error('Save flow failed');
		}
	};
	useEffect(() => {
		if (!flowId) return;
		const getDetailFlow = async () => {
			const response: any = await apiInstance.get(`/flow/detail?flowId=${flowId}`);
			console.log(flowId, response);
			setFlowData({
				flowName: response.flow?.flowName,
				description: response.flow?.description
			});
			const listNode = response.nodes?.map((node: any) => {
				return {
					id: node.id,
					type: node.nodeType,
					nodeName: node.nodeName,
					measured: JSON.parse(node.measured),
					position: JSON.parse(node.position),
					data: {
						label: node.nodeName,
						id: node.id
					}
				};
			});
			setNodes(listNode);
			const listEdge = response.connections?.map((edge: any) => {
				return {
					source: edge.sourceNodeId,
					target: edge.targetNodeId
				};
			});
			setEdges(listEdge);
		};
		getDetailFlow();
	}, [flowId]);

	useEffect(() => {
		// handle delete node when press delete key
		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'Delete') {
				const selectedNodes = document.querySelectorAll('.selected');
				if (selectedNodes.length) {
					selectedNodes.forEach((node) => {
						const nodeId = node.id;
						handleDeleteNode(nodeId);
					});
				}
			}
		};
		document.addEventListener('keyup', onKeyUp);
		return () => {
			document.removeEventListener('keyup', onKeyUp);
		};
	}, [nodes, edges, handleDeleteNode]);
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
							<span>{flowData?.flowName ?? 'Initial Flow'}</span>
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
							<Icons.SettingProfile className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
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
					<Popover content={<AddNodeMenuPopup onChangeNodeType={handleChangeNodeType} />} trigger="click">
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

// const nod = {
// 	"id": "",
// 	"connections": [
// 			{
// 					"sourceNodeId": "commandOutput_2f177c16-f3e6-4850-9251-2a92660de6d0"
// 			}
// 	],
// 	"description": "test command",
// 	"flowName": "test command",
// 	"isActive": true,
// 	"nodes": [
// 			{
// 				"id": "commandInput_89c7eef7-3004-47c4-b8a8-e55933694de9",
// 				"nodeType": "commandInput",
// 				"nodeName":"commandInput",
// 				"position":{"x":-36, "y":-20},
// 				"measured":{"width":250,"height":340},
// 				"parameters":[
// 					{
// 						"parameterKey":"commandName",
// 						"parameterValue":"xin chao"
// 					},
// 					{
// 						"parameterKey":"commandCode",
// 						"parameterValue":"hello"
// 					}
// 				]
// 			},
// 			{
// 				"id":"commandOutput_2f177c16-f3e6-4850-9251-2a92660de6d0",
// 				"nodeType":"commandOutput",
// 				"nodeName":"commandOutput",
// 				"position":{"x":268, "y":-27},
// 				"measured":{"width":250, "height":271},
// 				"parameters":[
// 					{
// 						"parameterKey":"commandName",
// 						"parameterValue":"hi"
// 					}
// 				]
// 			}
// 	],
// 	"userId": "1831890355411226624"
// }
