import { BrowserWindow, screen, shell } from 'electron';
import { join } from 'path';
import { format } from 'url';
import { environment } from '../environments/environment';
import { rendererAppName, rendererAppPort } from './constants';

import { setup } from 'electron-push-receiver';

let deeplinkingUrl;

export default class App {
	// Keep a global reference of the window object, if you don't, the window will
	// be closed automatically when the JavaScript object is garbage collected.
	static mainWindow: Electron.BrowserWindow;
	static application: Electron.App;
	static BrowserWindow;

	public static isDevelopmentMode() {
		const isEnvironmentSet: boolean = 'ELECTRON_IS_DEV' in process.env;
		const getFromEnvironment: boolean = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

		return isEnvironmentSet ? getFromEnvironment : !environment.production;
	}

	private static onWindowAllClosed() {
		if (process.platform !== 'darwin') {
			App.application.quit();
		}
	}

	private static onClose() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		App.mainWindow = null;
	}

	private static onReady() {
		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs.
		if (rendererAppName) {
			App.initMainWindow();
			App.loadMainWindow();
		}

		setup(App.mainWindow.webContents);
	}

	private static onActivate() {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (App.mainWindow === null) {
			App.onReady();
		}
	}

	private static initMainWindow() {
		const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
		const width = Math.min(1280, workAreaSize.width || 1280);
		const height = Math.min(720, workAreaSize.height || 720);

		// Create the browser window.
		App.mainWindow = new BrowserWindow({
			width: width,
			height: height,
			show: false,
			webPreferences: {
				contextIsolation: true,
				backgroundThrottling: false,
				preload: join(__dirname, 'main.preload.js'),
			},
		});
		App.mainWindow.setMenu(null);
		App.mainWindow.center();

		const gotTheLock = App.application.requestSingleInstanceLock();
		if (gotTheLock) {
			App.application.on('second-instance', (e, argv) => {
				if (process.platform == 'win32') {
					deeplinkingUrl = argv.slice(1);

					const url = argv.pop().slice(1);

					if (url) {
						const index = url.indexOf('=');
						const dataString = url.substring(index + 1);

						if (dataString) {
							App.mainWindow.webContents.send('send-data-to-renderer', dataString);
							App.loadMainWindow();
						}
					}
				}

				if (App.mainWindow) {
					if (App.mainWindow.isMinimized()) App.mainWindow.restore();
					App.mainWindow.focus();
				}
			});
		} else {
			App.application.quit();
			return;
		}

		if (!App.application.isDefaultProtocolClient('mezonapp')) {
			App.application.setAsDefaultProtocolClient('mezonapp');
		}

		App.application.on('will-finish-launching', function () {
			// Protocol handler for osx
			App.application.on('open-url', function (event, url) {
				event.preventDefault();
				deeplinkingUrl = url;
			});
		});

		// if main window is ready to show, close the splash window and show the main window
		App.mainWindow.once('ready-to-show', () => {
			App.mainWindow.show();
		});

		// handle all external redirects in a new browser window
		App.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
			shell.openExternal(url);
			return { action: 'deny' };
		});

		// Emitted when the window is closed.
		App.mainWindow.on('closed', () => {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			App.mainWindow = null;
		});
	}

	private static loadMainWindow() {
		// load the index.html of the app.
		if (!App.application.isPackaged) {
			App.mainWindow.loadURL(`http://localhost:${rendererAppPort}`);
		} else {
			App.mainWindow.loadURL(
				format({
					pathname: join(__dirname, '..', rendererAppName, 'index.html'),
					protocol: 'file:',
					slashes: true,
				}),
			);
		}

		if (process.platform == 'win32') {
			// Keep only command line / deep linked arguments
			deeplinkingUrl = process.argv.slice(1);
		}
	}

	static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
		// we pass the Electron.App object and the
		// Electron.BrowserWindow into this function
		// so this class has no dependencies. This
		// makes the code easier to write tests for

		App.BrowserWindow = browserWindow;
		App.application = app;

		App.application.on('window-all-closed', App.onWindowAllClosed); // Quit when all windows are closed.
		App.application.on('ready', App.onReady); // App is ready to load data
		App.application.on('activate', App.onActivate); // App is activated
	}
}
