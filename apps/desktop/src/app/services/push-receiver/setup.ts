import { ipcMain } from 'electron';
import Store from 'electron-store';
import { listen, register } from 'push-receiver-v2';
import { environment } from '../../../environments/environment';
import {
	FCM_TOKEN_UPDATED,
	NOTIFICATION_RECEIVED,
	NOTIFICATION_SERVICE_ERROR,
	NOTIFICATION_SERVICE_STARTED,
	START_NOTIFICATION_SERVICE
} from '../../events/constants';
import { ElectronStoreType } from './types';

const electronStore = new Store<ElectronStoreType>();

const { apiKey, appId, projectId, vapidKey } = environment.firebaseCouldMessage;

const firebaseConfig = {
	firebase: {
		apiKey: apiKey,
		appID: appId,
		projectID: projectId
	},
	vapidKey: vapidKey
};

// To be sure that start is called only once
let started = false;

// To be call from the main process
function setup(webContents: Electron.WebContents) {
	console.log('webContents: ', webContents);
	// Will be called by the renderer process
	ipcMain.on(START_NOTIFICATION_SERVICE, async (_, senderId: string) => {
		// Retrieve saved credentials
		let credentials = electronStore.get('credentials');
		// Retrieve saved senderId
		const savedSenderId = electronStore.get('senderId');
		if (started) {
			webContents.send(NOTIFICATION_SERVICE_STARTED, credentials?.fcm?.token);
			return;
		}
		started = true;
		try {
			// Retrieve saved persistentId : avoid receiving all already received notifications on start
			const persistentIds = electronStore.get('persistentIds') || [];
			// Register if no credentials or if senderId has changed
			if (!credentials || savedSenderId !== senderId) {
				credentials = await register(firebaseConfig);
				// Save credentials for later use
				electronStore.set('credentials', credentials);
				// Save senderId
				electronStore.set('senderId', senderId);
				// Notify the renderer process that the FCM token has changed
				webContents.send(FCM_TOKEN_UPDATED, credentials.fcm.token);
			}
			// Listen for GCM/FCM notifications
			await listen({ ...credentials, persistentIds }, onNotificationFactory(webContents));
			// Notify the renderer process that we are listening for notifications
			webContents.send(NOTIFICATION_SERVICE_STARTED, credentials?.fcm?.token);
		} catch (e) {
			console.error('PUSH_RECEIVER:::Error while starting the service', e);
			// Forward error to the renderer process
			webContents.send(NOTIFICATION_SERVICE_ERROR, e.message);
		}
	});
}

// Will be called on new notification
function onNotificationFactory(webContents: Electron.WebContents) {
	console.log('webContents: ', webContents);

	return ({ notification, persistentId }) => {
		const persistentIds = electronStore.get('persistentIds') || [];
		// Update persistentId
		electronStore.set('persistentIds', [...persistentIds, persistentId]);
		// Notify the renderer process that a new notification has been received
		// And check if window is not destroyed for darwin Apps
		if (!webContents.isDestroyed()) {
			webContents.send(NOTIFICATION_RECEIVED, notification);
		}
	};
}

export { setup as setupPushReceiver };
