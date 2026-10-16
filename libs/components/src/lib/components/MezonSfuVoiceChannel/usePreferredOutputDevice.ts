import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	OUTPUT_DEVICE_CHANGE_EVENT,
	PREFERRED_OUTPUT_DEVICE_STORAGE_KEY,
	getPreferredOutputDeviceId,
	parseOutputDeviceChangeEventDetail,
	setPreferredOutputDeviceId,
	supportsAudioOutputDeviceSelection
} from './preferredOutputDevice';

export function usePreferredOutputDevice() {
	const [outputDeviceId, setOutputDeviceId] = useState(() => getPreferredOutputDeviceId());
	const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);

	const hasSetSinkId = useMemo(() => supportsAudioOutputDeviceSelection(), []);

	const refreshOutputDevices = useCallback(async () => {
		if (!navigator.mediaDevices?.enumerateDevices) {
			setOutputDevices([]);
			return;
		}
		const devices = await navigator.mediaDevices.enumerateDevices();
		const outputs = devices.filter((device) => device.kind === 'audiooutput');
		setOutputDevices(outputs);
		const current = getPreferredOutputDeviceId();
		if (current !== 'default' && outputs.length > 0 && !outputs.some((device) => device.deviceId === current)) {
			setPreferredOutputDeviceId('default');
			return;
		}
		if (outputs.length === 0 && current !== 'default') {
			setPreferredOutputDeviceId('default');
		}
	}, []);

	useEffect(() => {
		void refreshOutputDevices();
		navigator.mediaDevices?.addEventListener?.('devicechange', refreshOutputDevices);
		return () => navigator.mediaDevices?.removeEventListener?.('devicechange', refreshOutputDevices);
	}, [refreshOutputDevices]);

	useEffect(() => {
		const syncFromStorage = () => {
			setOutputDeviceId(getPreferredOutputDeviceId());
		};
		const handleOutputDeviceChange = (event: Event) => {
			setOutputDeviceId(parseOutputDeviceChangeEventDetail((event as CustomEvent).detail));
		};
		const handleStorage = (event: StorageEvent) => {
			if (event.key === PREFERRED_OUTPUT_DEVICE_STORAGE_KEY) syncFromStorage();
		};

		window.addEventListener(OUTPUT_DEVICE_CHANGE_EVENT, handleOutputDeviceChange);
		window.addEventListener('storage', handleStorage);
		return () => {
			window.removeEventListener(OUTPUT_DEVICE_CHANGE_EVENT, handleOutputDeviceChange);
			window.removeEventListener('storage', handleStorage);
		};
	}, []);

	const changeOutputDevice = useCallback((deviceId: string) => {
		setPreferredOutputDeviceId(deviceId);
	}, []);

	const handleSinkIdFailure = useCallback((failedSinkId?: string) => {
		const current = getPreferredOutputDeviceId();
		if (current !== 'default' && (failedSinkId === undefined || current === failedSinkId)) {
			setPreferredOutputDeviceId('default');
		}
	}, []);

	return {
		hasSetSinkId,
		outputDeviceId,
		outputDevices,
		changeOutputDevice,
		handleSinkIdFailure,
		refreshOutputDevices
	};
}
