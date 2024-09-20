/**
 * When developing low level UI components,
 * it is common to have to use a local ref but also support an external one using React.forwardRef.
 * Natively, React does not offer a way to set two refs inside the ref property. This is the goal of this small utility.
 *
 * Usage:
 * ```tsx
 * const Example = React.forwardRef(function Example(props, ref) {
 * const localRef = React.useRef();
 * return <div ref={mergeRefs(localRef, ref)} />;
 * });
 * ```
 *
 * @param {(React.Ref<T> | undefined)[]} inputRefs Array of refs
 * @returns {React.Ref<T> | React.RefCallback<T>} Merged refs
 */
export function mergeRefs<T>(...inputRefs: (React.Ref<T> | undefined)[]): React.Ref<T> | React.RefCallback<T> {
	const filteredInputRefs = inputRefs.filter(Boolean);

	if (filteredInputRefs.length <= 1) {
		const firstRef = filteredInputRefs[0];

		return firstRef || null;
	}

	return function mergedRefs(ref) {
		for (const inputRef of filteredInputRefs) {
			if (typeof inputRef === 'function') {
				inputRef(ref);
			} else if (inputRef) {
				(inputRef as React.MutableRefObject<T | null>).current = ref;
			}
		}
	};
}
