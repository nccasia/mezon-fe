export type ElectronBridgeHandler = (...args: any[]) => void;
export type MezonElectronAPI = {
	platform: NodeJS.Platform;
	getAppVersion: () => Promise<string>;
	on: (eventName: string, callback: ElectronBridgeHandler) => void;
	send: (eventName: string, ...params: any[]) => void;
	removeListener: (channel: string, listener: ElectronBridgeHandler) => void;
	getDeviceId: () => Promise<string>;
	senderId: (senderId: string) => Promise<string>;
	setBadgeCount: (badgeCount: number | null) => void;
};
declare global {
	interface Window {
		electron: MezonElectronAPI;
	}
}

export interface IElectronBridge {
	initListeners: (callback: ElectronBridgeHandler) => void;
	removeAllListeners: () => void;
	setBadgeCount: (badgeCount: number | null) => void;
}
