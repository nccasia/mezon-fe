import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export function getAppInfo() {
	return {
		...getBasicAppInfo(),
		app_device_name: DeviceInfo.getDeviceNameSync()
	};
}

export function getBasicAppInfo() {
	return {
		app_device_id: DeviceInfo.getDeviceId(),
		app_version: '1.0.0',
		app_platform: Platform.OS,
		app_name: 'Mezon',
		app_env: ''
	};
}

export const IS_TABLET = DeviceInfo.isTablet();
