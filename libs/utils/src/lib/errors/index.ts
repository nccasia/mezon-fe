import { PayloadAction } from '@reduxjs/toolkit';

export type FormalError = {
	message: string;
	name: string;
	stack: string;
	action: any;
};

export function isFormalError(error: unknown): error is FormalError {
	return typeof error === 'object' && error !== null && 'message' in error && 'name' in error && 'stack' in error;
}

export function trackError(rawError: unknown) {
	const formalError = isFormalError(rawError) ? rawError : extractActionError(rawError);
	console.log(formalError);
}

export function trackActionError(action: PayloadAction<unknown, string, unknown>, raise = false) {

	if ('error' in action === false) {
		return;
	}

	if (action.error) {
		const error = extractActionError(action);
		trackError(error);

		if (raise) {
			throw error;
		}
	}
}

export function extractActionError(action: any): FormalError {
	if(!action){
		return {
			message: "un not error",
			name: 'Error',
			stack: '',
			action: '',
		};
	}
	const error = action.error
	if (typeof action === 'string') {
		return {
			message: error,
			name: 'Error',
			stack: '',
			action: action,
		};
	}

	if (error instanceof Error) {
		return {
			message: error.message,
			name: error.name,
			stack: error.stack ?? '',
			action: action,
		};
	}

	if (typeof error === 'object' && error !== null) {
		return {
			message: '',
			name: '',
			stack: '',
			...JSON.parse(JSON.stringify(error)),
			action: action,
		};
	}

	return {
		message: 'Unknown error',
		name: 'Error',
		stack: '',
		action: action,
	};
}
