export function isEqual(value: any, other: any): boolean {
	if (value === other) {
		return true;
	}

	if (typeof value !== 'object' || value === null || typeof other !== 'object' || other === null) {
		return false;
	}

	if (Array.isArray(value) !== Array.isArray(other)) {
		return false;
	}

	const valueKeys = Object.keys(value);
	const otherKeys = Object.keys(other);

	if (valueKeys.length !== otherKeys.length) {
		return false;
	}

	for (const key of valueKeys) {
		if (!isEqual(value[key], other[key])) {
			return false;
		}
	}

	return true;
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return function (...args: Parameters<T>) {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func(...args);
		}, wait);
	};
}

export function isEmpty(value: any) {
	if (value == null) {
		return true;
	}
	if (typeof value === 'string' || Array.isArray(value)) {
		return value.length === 0;
	}
	if (typeof value === 'object') {
		return Object.keys(value).length === 0;
	}
	return false;
}

export function cloneDeep<T>(value: T): T {
	// Check if the value is null or not an object (primitive value)
	if (value === null || typeof value !== 'object') {
		return value;
	}

	return JSON.parse(JSON.stringify(value)) as T;
}
