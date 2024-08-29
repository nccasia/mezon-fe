import { contextBridge, ipcRenderer } from 'electron';
import { UPDATE_BADGE_COUNT } from '../services/badge/constants';

contextBridge.exposeInMainWorld('electron', {
	getAppVersion: () => ipcRenderer.invoke('get-app-version'),
	platform: process.platform,
	ipcRenderer: ipcRenderer,
	on(eventName: string, callback: () => void) {
		ipcRenderer.on(eventName, callback);
	},
	send(eventName: string, ...params: unknown[]) {
		return ipcRenderer.send(eventName, ...params);
	},
	removeListener(channel: string, listener: () => void) {
		return ipcRenderer.removeListener(channel, listener);
	},
	getDeviceId: () => ipcRenderer.invoke('get-device-id'),
	senderId: (senderId: string) => ipcRenderer.invoke('sender-id', senderId),
	setBadgeCount: (badgeCount: number) => ipcRenderer.send(UPDATE_BADGE_COUNT, badgeCount)
});
