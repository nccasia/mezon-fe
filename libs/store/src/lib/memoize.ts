import memoize from 'memoizee';

const memoizedFunctions: Array<ReturnType<typeof memoize>> = [];

export const memoizeAndTrack = <T extends (...args: any[]) => any>(fn: T, options?: memoize.Options<T>) => {
	const memoizedFn = memoize(fn, options);
	memoizedFunctions.push(memoizedFn);
	return memoizedFn;
};

export const clearAllMemoizedFunctions = () => {
	memoizedFunctions.forEach((fn) => fn.clear());
};
