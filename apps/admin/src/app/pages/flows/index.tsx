import { Icons } from '@mezon/ui';
import { addEdge, Background, BackgroundVariant, Connection, Controls, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Popover } from 'flowbite-react';
import React, { useCallback, useRef } from 'react';
import AddNodeMenuPopup from './AddNodeMenuPopup';

const initialNodes = [
	{ id: '1', position: { x: 0, y: 0 }, data: { label: '1' }, type: 'input' },
	{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
	{ id: '3', position: { x: 100, y: 150 }, data: { label: '3' } }
];
const type = 'default';

let id = 0;
const getId = () => `dndnode_${id++}`;

const Flows = () => {
	const [isZoomFlowLayout, setIsZoomFlowLayout] = React.useState<boolean>(false);
	const reactFlowWrapper = useRef(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const { screenToFlowPosition } = useReactFlow();
	const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);
	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY
			});
			const newNode = {
				id: getId(),
				type,
				position,
				data: { label: `${type} node` }
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[screenToFlowPosition, type]
	);
	return (
		<div
			ref={reactFlowWrapper}
			className={`border-gray-200 border-[1px] w-full transition-all ${isZoomFlowLayout ? 'fixed top-0 left-0 right-0 bottom-0 z-50 h-[100vh]' : 'relative h-[calc(100vh-95px)]'}`}
		>
			<div className="absolute top-2 left-3 right-3 z-10 bg-gray-50 dark:bg-gray-400 h-[50px] flex items-center justify-between px-3 rounded-full">
				<div className="flex items-center gap-2">
					<Popover content={<AddNodeMenuPopup />} title="Add new node" trigger="click">
						<button className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md">
							<Icons.AddIcon className="w-6 h-6" />
						</button>
					</Popover>
					<div className="text-[24px] font-semibold ml-[30px] pl-[10px] border-l-[1px] border-l-gray-300">Flow</div>
				</div>
				<div className="rightbox">
					<button className="p-2 rounded-full hover:bg-[#cccccc66] shadow-md" onClick={() => setIsZoomFlowLayout(!isZoomFlowLayout)}>
						<Icons.ZoomIcon className="w-6 h-6" />
					</button>
				</div>
			</div>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onDrop={onDrop}
				onDragOver={onDragOver}
				fitView
				colorMode="light"
			>
				<Controls />
				<Background className="dark:bg-bgPrimary bg-bgLightPrimary text-gray-500 dark:text-gray-100" variant={BackgroundVariant.Dots} />
			</ReactFlow>
		</div>
	);
};
export default Flows;
