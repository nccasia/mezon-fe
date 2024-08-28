export function findParentByClass(element: HTMLElement, className: string): HTMLElement | null {
	let parent = element.parentElement;
	while (parent) {
		if (parent.classList.contains(className)) {
			return parent;
		}
		parent = parent.parentElement;
	}
	return null;
}
