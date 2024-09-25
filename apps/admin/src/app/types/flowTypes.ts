export interface IFlow {
	id: string;
	name: string;
	description: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export type INodeType = 'commandInput' | 'uploadedImage' | 'formatFunction' | 'apiLoader' | 'default';

export interface INode {
	id: string;
	nodeType: INodeType;
	nodeName: string;
	data: {
		label?: string;
		id: string;
	};
	parameters: IParameter[];
	position: {
		x: number;
		y: number;
	};
	measured: {
		width: number;
		height: number;
	};
	selected: boolean;
}
export interface IEdge {
	id?: string;
	sourceNodeId: string;
	targetNodeId: string;
	sourceHandleId: string;
	targetHandleId: string;
}

export interface IFlowDataRequest {
	userId: string;
	flowId?: string;
	flowName: string;
	description: string;
	isActive: boolean;
	connections: IEdge[];
	nodes: INode[];
}

export interface IParameter {
	parameterKey: string;
	parameterValue: string;
}
