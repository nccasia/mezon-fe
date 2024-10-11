import { IFlow, IFlowDataRequest, IFlowDetail } from '../stores/flow/flow.interface';
import { apiInstance } from './apiInstance';

interface IError {
	response: {
		data: {
			message: string;
		};
	};
}

const getAllFlowByApplication = async (applicationId: string): Promise<IFlow[]> => {
	try {
		const listFlow = await apiInstance.get(`/flow/getAllByApplication?appId=${applicationId}`);
		return listFlow.data as IFlow[];
	} catch (error) {
		throw (error as IError).response.data;
	}
};

const getFlowDetail = async (flowId: string): Promise<IFlowDetail> => {
	try {
		const flowDetail: IFlowDetail = await apiInstance.get(`/flow/detail?flowId=${flowId}`);
		return flowDetail;
	} catch (error) {
		throw (error as IError).response?.data;
	}
};

const createNewFlow = async (dataCreate: IFlowDataRequest): Promise<IFlowDetail> => {
	try {
		const response: IFlowDetail = await apiInstance.post('/flow/create', dataCreate);
		return response;
	} catch (error) {
		throw (error as IError).response.data;
	}
};

const updateFlow = async (dataUpdate: IFlowDataRequest): Promise<IFlowDetail> => {
	try {
		const response: IFlowDetail = await apiInstance.put('/flow/update', dataUpdate);
		return response;
	} catch (error) {
		throw (error as IError).response.data;
	}
};

const deleteFlow = async (flowId: string): Promise<IFlowDetail> => {
	try {
		const response: IFlowDetail = await apiInstance.delete(`/flow/delete?flowId=${flowId}`);
		return response;
	} catch (error) {
		throw (error as IError).response.data;
	}
};

const executionFlow = async (appId: string, appToken: string, message: string): Promise<{ message: string; urlImage: string }> => {
	try {
		const response: { message: string; urlImage: string } = await apiInstance.post(`/execution`, { appId, message, appToken });
		return response;
	} catch (error) {
		throw (error as IError).response.data;
	}
};

const flowService = {
	getAllFlowByApplication,
	getFlowDetail,
	createNewFlow,
	updateFlow,
	deleteFlow,
	executionFlow
};
export default flowService;
