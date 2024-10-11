import React, { Dispatch, createContext, useReducer } from 'react';
import flowReducer, { initFlowState } from '../stores/flow/flow.reducer';
import { FlowActionType, IFlowState } from '../stores/flow/flow.type';

type flowDispatch = Dispatch<FlowActionType>;

export const FlowContext = createContext<{ flowState: IFlowState; flowDispatch: flowDispatch }>({
	flowState: initFlowState,
	flowDispatch: () => {
		// Provide a default function to avoid TypeScript errors
	}
});

const FlowProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
	const [flowState, flowDispatch] = useReducer(flowReducer, initFlowState);

	return <FlowContext.Provider value={{ flowState, flowDispatch }}>{children}</FlowContext.Provider>;
};

export default FlowProvider;
