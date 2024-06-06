import { app, BrowserWindow, ipcMain } from 'electron';
import { machineId } from 'node-machine-id';
import App from './app/app';
import ElectronEvents from './app/events/electron.events';
import SquirrelEvents from './app/events/squirrel.events';

export default class Main {
	static initialize() {
		if (SquirrelEvents.handleEvents()) {
			// squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
			app.quit();
		}
	}

	static bootstrapApp() {
		App.main(app, BrowserWindow);
	}

	static bootstrapAppEvents() {
		ElectronEvents.bootstrapElectronEvents();

		// initialize auto updater service
		if (!App.isDevelopmentMode()) {
			// UpdateEvents.initAutoUpdateService();
		}
	}
}

ipcMain.handle('get-device-id', async () => {
	return await machineId();
});

// handle setup events as quickly as possible
Main.initialize();

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();
