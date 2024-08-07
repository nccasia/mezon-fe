import { useEffect, useRef } from 'react';
import { ELoadMoreDirection, IBeforeRenderCb, ILoadMoreCb } from '../index';

/**
 * React hook which creates a usable data loader for useInfiniteScroll hook.
 * It is only useful if new data is always added to the beginning of the array.
 * Should one need a different behavior or better optimization techniques - custom implementation would be needed.
 * @param dataLoader Data loader function to be converted into compatible callback for useDataLoader.
 * @param data Data to be shown in a scrollable HTML element.
 * @param setData Method for setting data into state.
 * @param args Array of arguments to be passed to data loader
 */
export const useDataLoader = (dataLoader: IDataLoaderCb, data: any[], setData: ISetDataCb, args: any[] = []): ILoadMoreCb => {
	const argsRef = useRef(args);
	const dataRef = useRef(data);
	const resolveRef = useRef<null | ((any: any) => void)>(null);

	useEffect(() => {
		dataRef.current = data;
	}, [data, data.length]);

	useEffect(() => {
		argsRef.current = [...args];
	}, [...args]);

	const loader = async (direction: ELoadMoreDirection, beforeRender: IBeforeRenderCb) => {
		const chunk = await dataLoader(...argsRef.current);
		beforeRender();

		const promise = new Promise((resolve) => {
			resolveRef.current = resolve;
		});

		setData([...chunk, ...dataRef.current]);
		return promise;
	};

	useEffect(() => {
		if (resolveRef.current) {
			resolveRef.current(null); // Pass null as an argument to the function call
			resolveRef.current = null;
		}
	}, [data]);

	return loader;
};

/**
 * Callback for loading additional data for scrollable HTML element.
 * Arguments for this function are passed as second argument of useDataLoader hook.
 */
export type IDataLoaderCb = (...args: any[]) => any;

/**
 * Method used for setting new data into state.
 */
export type ISetDataCb = (data: any[]) => void;
