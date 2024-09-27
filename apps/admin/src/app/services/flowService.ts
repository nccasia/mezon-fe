import { IFlow, IFlowDataRequest, IFlowDetail } from '../types/flowTypes';
import { apiInstance } from './apiInstance';

const getAllFlows = async (): Promise<IFlow[]> => {
	try {
		const listFlow: IFlow[] = await apiInstance.get('/flow/getAll');
		return listFlow;
	} catch (error) {
		console.log('error', error);
		throw (error as any).response.data;
	}
};

const getFlowDetail = async (flowId: string): Promise<IFlowDetail> => {
	try {
		const flowDetail: IFlowDetail = await apiInstance.get(`/flow/detail?flowId=${flowId}`);
		return flowDetail;
	} catch (error) {
		throw (error as any).response?.data;
	}
};

const createNewFlow = async (dataCreate: IFlowDataRequest): Promise<IFlowDetail> => {
	try {
		const response: IFlowDetail = await apiInstance.post('/flow/create', dataCreate);
		return response;
	} catch (error) {
		throw (error as any).response.data;
	}
};

const updateFlow = async (dataUpdate: IFlowDataRequest): Promise<IFlowDetail> => {
	try {
		const response: IFlowDetail = await apiInstance.put('/flow/update', dataUpdate);
		return response;
	} catch (error) {
		throw (error as any).response.data;
	}
};

const flowService = {
	getAllFlows,
	getFlowDetail,
	createNewFlow,
	updateFlow
};
export default flowService;
