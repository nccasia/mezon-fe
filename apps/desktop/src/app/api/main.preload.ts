import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	getAppVersion: () => ipcRenderer.invoke('get-app-version'),
	platform: process.platform,
	ipcRenderer: ipcRenderer,
	on(eventName, callback) {
		ipcRenderer.on(eventName, callback);
	},
	send(eventName, ...params) {
		return ipcRenderer.send(eventName, ...params);
	},
	removeListener(channel, listener) {
		return ipcRenderer.removeListener(channel, listener);
	},
	getDeviceId: () => ipcRenderer.invoke('get-device-id'),
});
