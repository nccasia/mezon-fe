import { Edge, Node } from '@xyflow/react';
import { INodeType } from '../../types/flowTypes';

export enum FLOW_ACTION_TYPE {
	SET_NODES = 'SET_NODES',
	SET_EDGES = 'SET_EDGES',
	ADD_NODE = 'ADD_NODE',
	ADD_EDGE = 'ADD_EDGE',
	DELETE_NODE = 'DELETE_NODE',
	DELETE_EDGE = 'DELETE_EDGE',
	COPY_NODE = 'COPY_NODE',
	CHANGE_NODE_TYPE = 'CHANGE_NODE_TYPE'
}
export interface IFlowState {
	nodes: Node[];
	edges: Edge[];
	nodeType: INodeType;
}
export interface FlowActionType {
	type: FLOW_ACTION_TYPE;
	payload: any;
}
