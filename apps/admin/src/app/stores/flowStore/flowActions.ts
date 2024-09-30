import { Edge, Node } from '@xyflow/react';
import { INodeType, ISelectedNode } from '../../types/flowTypes';
import { FLOW_ACTION_TYPE, FlowActionType } from './flowTypes';

export const setNodesContext = (nodes: Node[]): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.SET_NODES,
		payload: nodes
	};
};

export const setEdgesContext = (edges: Edge[]): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.SET_EDGES,
		payload: edges
	};
};
export const addNode = (position: { x: number; y: number }): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.ADD_NODE,
		payload: position
	};
};
export const addEdge = (edge: Edge): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.ADD_EDGE,
		payload: edge
	};
};
export const deleteNode = (nodeId: string): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.DELETE_NODE,
		payload: nodeId
	};
};
export const deleteEdge = (edgeId: string): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.DELETE_EDGE,
		payload: edgeId
	};
};
export const copyNode = (nodeId: string, defaultValue: any): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.COPY_NODE,
		payload: { nodeId, defaultValue }
	};
};
export const changeNodeType = (nodeType: INodeType): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.CHANGE_NODE_TYPE,
		payload: nodeType
	};
};
export const changeSelectedNode = (node: ISelectedNode | null): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.CHANGE_SELECTED_NODE,
		payload: node
	};
};
export const changeOpenModalNodeDetail = (open: boolean): FlowActionType => {
	return {
		type: FLOW_ACTION_TYPE.CHANGE_OPEN_MODAL_NODE_DETAIL,
		payload: open
	};
};
