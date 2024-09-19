import {
	FCM_TOKEN_UPDATED,
	NAVIGATE_TO_URL,
	NOTIFICATION_RECEIVED,
	NOTIFICATION_SERVICE_ERROR,
	NOTIFICATION_SERVICE_STARTED,
	SENDER_ID,
	START_NOTIFICATION_SERVICE,
	TRIGGER_SHORTCUT
} from './constants';
import { ElectronBridgeHandler, IElectronBridge, MezonElectronAPI } from './types';

export class ElectronBridge implements IElectronBridge {
	private readonly bridge: MezonElectronAPI = window.electron;

	private static instance: ElectronBridge | undefined = undefined;

	public static getInstance(): ElectronBridge {
		if (!ElectronBridge.instance) {
			ElectronBridge.instance = new ElectronBridge();
		}
		return ElectronBridge.instance;
	}

	private hasListeners = false;
	private shortcutHandler?: () => void;

	private constructor() {
		// private constructor to prevent instantiation
	}

	public initListeners(shortcutHandler: () => void) {
		if (this.hasListeners) {
			return;
		}
		this.shortcutHandler = shortcutHandler;
		this.setupSenderId();
		this.setupPushReceiver();
		this.setupShortCut();
		this.hasListeners = true;
	}

	public removeAllListeners() {
		this.bridge.removeListener(NOTIFICATION_SERVICE_STARTED, this.notificationServiceStartedHandler);
		this.bridge.removeListener(NOTIFICATION_RECEIVED, this.notificationReceivedHandler);
		this.bridge.removeListener(NOTIFICATION_SERVICE_ERROR, this.notificationErrorhandler);
		this.bridge.removeListener(FCM_TOKEN_UPDATED, this.tokenUpdatedHandler);
		this.bridge.removeListener(TRIGGER_SHORTCUT, this.triggerShortcut);
		this.hasListeners = false;
	}

	public setBadgeCount(badgeCount: number) {
		this.bridge.setBadgeCount(badgeCount);
	}

	private setupSenderId() {
		this.bridge.senderId(SENDER_ID).then((senderId: string) => {
			this.bridge.send(START_NOTIFICATION_SERVICE, senderId);
		});
	}

	private setupPushReceiver() {
		this.bridge.on(NOTIFICATION_SERVICE_STARTED, this.listenerHandlers[NOTIFICATION_SERVICE_STARTED]);
		this.bridge.on(NOTIFICATION_RECEIVED, this.listenerHandlers[NOTIFICATION_RECEIVED]);
		this.bridge.on(NOTIFICATION_SERVICE_ERROR, this.listenerHandlers[NOTIFICATION_SERVICE_ERROR]);
		this.bridge.on(FCM_TOKEN_UPDATED, this.listenerHandlers[FCM_TOKEN_UPDATED]);
	}

	private setupShortCut() {
		this.bridge.on(TRIGGER_SHORTCUT, this.listenerHandlers[TRIGGER_SHORTCUT]);
	}

	private notificationServiceStartedHandler = (_: unknown, token: string) => {
		localStorage.setItem('fcmToken', token);
		this.bridge.getDeviceId().then((deviceId) => {
			const fcmTokenObject = { token, deviceId };
			localStorage.setItem('fcmTokenObject', JSON.stringify(fcmTokenObject));
		});
	};

	private notificationErrorhandler = (error: string) => {
		console.error('notification error', error);
	};

	private notificationReceivedHandler = (
		_: unknown,
		serverNotificationPayload: { notification: { body: any; title: string; image: string }; data: { link: string | URL } }
	) => {
		if (serverNotificationPayload.notification.body) {
			const notification = new Notification(serverNotificationPayload.notification.title, {
				body: serverNotificationPayload.notification.body,
				icon: serverNotificationPayload.notification.image,
				data: {
					link: serverNotificationPayload.data.link
				}
			});

			notification.onclick = () => {
				const notificationUrl = new URL(serverNotificationPayload.data.link);
				const currentPath = window.location.pathname;
				const path = notificationUrl.pathname;
				const isSubPath = currentPath.endsWith(path);

				if (path) {
					this.bridge?.send(NAVIGATE_TO_URL, path, isSubPath);
				}
			};
		} else {
			console.log('do something with the key/value pairs in the data', serverNotificationPayload.data);
		}
	};

	private tokenUpdatedHandler = (_: unknown, token: string) => {
		console.log(token);
	};

	private triggerShortcut = (_: unknown, name: string) => {
		if (this.shortcutHandler) {
			this.shortcutHandler();
		}
	};

	private readonly listenerHandlers: Record<string, ElectronBridgeHandler> = {
		[NOTIFICATION_SERVICE_STARTED]: this.notificationServiceStartedHandler,
		[NOTIFICATION_RECEIVED]: this.notificationReceivedHandler,
		[NOTIFICATION_SERVICE_ERROR]: this.notificationErrorhandler,
		[FCM_TOKEN_UPDATED]: this.tokenUpdatedHandler,
		[TRIGGER_SHORTCUT]: this.triggerShortcut
	};
}

export const electronBridge = ElectronBridge.getInstance();
