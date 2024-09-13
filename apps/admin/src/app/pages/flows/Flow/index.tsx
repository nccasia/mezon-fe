import { Icons } from '@mezon/ui';
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
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AddNodeMenuPopup from '../AddNodeMenuPopup';
import FlowChatPopup from '../FlowChat';
import CommandNode from '../nodes/CommandNode';
import DefaultNode from '../nodes/DefaultNode';
import SaveFlowModal from './SaveFlowModal';

const nodeTypes = {
	command: CommandNode,
	defaultCustom: DefaultNode
};

const initialNodes: Node[] = [
	// { id: '1', position: { x: 0, y: 0 }, data: { label: 'Command Node' }, type: 'command' },
	// { id: '2', position: { x: 300, y: 0 }, data: { label: 'Default Node' }, type: 'defaultCustom' }
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const Flow = () => {
	const navigate = useNavigate();
	const reactFlowWrapper = useRef(null);
	const [openModalSaveFlow, setOpenModalSaveFlow] = React.useState(false);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [nodeType, setNodeType] = React.useState('default');
	const { screenToFlowPosition } = useReactFlow();

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

	const handleCopyNode = useCallback(
		(nodeId: string) => {
			const node = nodes.find((n) => n.id === nodeId);
			if (!node) return;
			const newNode = {
				...node,
				id: getId(),
				position: { x: node.position.x + 50, y: node.position.y + 50 },
				data: {
					...node.data,
					onCopy: () => handleCopyNode(newNode.id),
					onDelete: () => handleDeleteNode(newNode.id)
				}
			};
			setNodes([...nodes, newNode]);
		},
		[nodes, setNodes, handleDeleteNode]
	);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY
			});
			const newNode = {
				id: getId(),
				type: nodeType,
				position,
				data: {
					label: `${nodeType} node`,
					onCopy: () => handleCopyNode(newNode.id),
					onDelete: () => handleDeleteNode(newNode.id)
				}
			};

			setNodes([...nodes, newNode]);
			// setNodes((nds) => nds.concat(newNode));
		},
		[screenToFlowPosition, nodeType, nodes, handleDeleteNode, handleCopyNode, setNodes]
	);

	const handleClickBackButton = () => {
		navigate(-1);
	};

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
							className="w-[40px] h-[40px] ml-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 border-[1px] transition-all active:bg-blue-200"
						>
							<Icons.LeftArrowIcon className="w-full" />
						</button>
						<div className="flex items-center text-[24px] font-semibold ml-[20px] pl-[10px] border-l-[1px] border-l-gray-300">
							<span>Initial Flow</span>
							<button
								onClick={() => setOpenModalSaveFlow(true)}
								className="ml-3 w-[30px] h-[30px] flex items-center justify-center border-[1px] border-gray-300 rounded hover:bg-gray-200"
							>
								<Icons.PenEdit />
							</button>
						</div>
					</div>
					<div className="rightbox flex items-center gap-2">
						<button className="w-[40px] h-[40px] mr-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 border-[1px] transition-all active:bg-blue-200">
							<Icons.IconTick />
						</button>
						<button className="w-[40px] h-[40px] mr-2  rounded-md flex items-center justify-center cursor-pointer bg-blue-200 hover:bg-blue-300 border-[1px] transition-all active:bg-blue-200">
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

			<SaveFlowModal title="Save Flow" open={openModalSaveFlow} onClose={() => setOpenModalSaveFlow(false)} />
		</div>
	);
};
export default Flow;
