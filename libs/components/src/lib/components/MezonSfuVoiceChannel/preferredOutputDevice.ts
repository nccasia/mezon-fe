export const PREFERRED_OUTPUT_DEVICE_STORAGE_KEY = 'mezon.voice.outputDeviceId';

export const OUTPUT_DEVICE_CHANGE_EVENT = 'mezon:outputDeviceChange';

export function normalizePreferredOutputDeviceId(deviceId: string | null | undefined): string {
	if (!deviceId) return 'default';
	return deviceId;
}

export function getPreferredOutputDeviceId(): string {
	return normalizePreferredOutputDeviceId(localStorage.getItem(PREFERRED_OUTPUT_DEVICE_STORAGE_KEY));
}

export function sinkIdForHtmlMediaElement(deviceId: string): string {
	return deviceId === 'default' ? '' : deviceId;
}

export function supportsAudioOutputDeviceSelection(): boolean {
	try {
		return typeof (HTMLMediaElement.prototype as unknown as { setSinkId?: unknown }).setSinkId === 'function';
	} catch {
		return false;
	}
}

export function notifyPreferredOutputDeviceChange(deviceId: string) {
	window.dispatchEvent(
		new CustomEvent(OUTPUT_DEVICE_CHANGE_EVENT, {
			detail: normalizePreferredOutputDeviceId(deviceId)
		})
	);
}

export function setPreferredOutputDeviceId(deviceId: string) {
	const normalized = normalizePreferredOutputDeviceId(deviceId);
	localStorage.setItem(PREFERRED_OUTPUT_DEVICE_STORAGE_KEY, normalized);
	notifyPreferredOutputDeviceChange(normalized);
}

export function parseOutputDeviceChangeEventDetail(detail: unknown): string {
	if (typeof detail === 'string') return normalizePreferredOutputDeviceId(detail);
	if (detail && typeof detail === 'object' && 'deviceId' in detail) {
		const deviceId = (detail as { deviceId?: string }).deviceId;
		return normalizePreferredOutputDeviceId(deviceId);
	}
	return getPreferredOutputDeviceId();
}
