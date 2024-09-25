import { app, BrowserWindow, Menu, MenuItemConstructorOptions, screen, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import { join } from 'path';
import { format } from 'url';
import { environment } from '../environments/environment';
import { rendererAppName, rendererAppPort } from './constants';

import tray from '../Tray';
import { TRIGGER_SHORTCUT } from './events/constants';
import { initBadge } from './services/badge';
import { setupPushReceiver } from './services/push-receiver';

const isQuitting = false;

export default class App {
	// Keep a global reference of the window object, if you don't, the window will
	// be closed automatically when the JavaScript object is garbage collected.
	static mainWindow: Electron.BrowserWindow;
	static application: Electron.App;
	static BrowserWindow: typeof Electron.BrowserWindow;

	public static isDevelopmentMode() {
		const isEnvironmentSet: boolean = 'ELECTRON_IS_DEV' in process.env;
		const getFromEnvironment: boolean = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

		return isEnvironmentSet ? getFromEnvironment : !environment.production;
	}

	private static onWindowAllClosed() {
		App.application.quit();
	}

	private static onClose(event) {
		if (!isQuitting) {
			event.preventDefault();
			App.mainWindow.hide();
		}
		return false;
	}

	private static onReady() {
		autoUpdater.checkForUpdates();
		if (rendererAppName) {
			App.initMainWindow();
			App.loadMainWindow();
			App.setupMenu();
			App.setupBadge();
			App.setupPushReceiver();
			tray.init(isQuitting);
		}
	}

	private static onActivate() {
		if (App.mainWindow === null) {
			App.onReady();
		}

		// reopen window after soft quit on macos
		if (process.platform === 'darwin' && !App.mainWindow?.isVisible()) {
			App.mainWindow?.show();
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
				preload: join(__dirname, 'main.preload.js')
			},
			icon: join(__dirname, 'assets', 'linux-icon.png')
		});
		App.mainWindow.setMinimumSize(950, 500);
		App.mainWindow.setMenuBarVisibility(false);
		App.mainWindow.center();

		const gotTheLock = App.application.requestSingleInstanceLock();
		if (gotTheLock) {
			App.application.on('second-instance', (e, argv) => {
				if (process.platform == 'win32' || process.platform == 'linux') {
					const url = argv.pop().slice(1);

					if (url) {
						const index = url.indexOf('data=');
						if (index > 0) {
							const dataString = url.substring(index + 5);

							if (dataString) {
								App.loadMainWindow({ deepLinkUrl: dataString });
							}
						}
					}
				}

				if (App.mainWindow) {
					if (App.mainWindow.isMinimized()) App.mainWindow.restore();
					App.mainWindow.show();
					App.mainWindow.focus();
				}
			});
		} else {
			App.application.quit();
			return;
		}

		//App.mainWindow.webContents.openDevTools();
		if (!App.application.isDefaultProtocolClient('mezonapp')) {
			App.application.setAsDefaultProtocolClient('mezonapp');
		}

		// Protocol handler for osx
		App.application.on('open-url', function (event, url) {
			event.preventDefault();

			if (url) {
				const index = url.indexOf('=');
				const dataString = url.substring(index + 1);

				if (dataString) {
					App.loadMainWindow({ deepLinkUrl: dataString });
				}
			}
		});

		App.application.on('will-finish-launching', function () {
			// console.log("will-finish-launching");
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
		App.mainWindow.on('close', (event) => this.onClose(event));

		App.application.on('before-quit', () => {
			tray.destroy();
			App.application.exit();
		});
	}

	private static generateQueryString(params: Record<string, string>): string {
		return Object.keys(params)
			.map((key) => {
				return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
			})
			.join('&');
	}

	private static generateFullUrl(base: string, params: Record<string, string>): string {
		if (params) {
			const queryString = App.generateQueryString(params);
			return queryString ? `${base}?${queryString}` : base;
		}
		return base;
	}

	private static loadMainWindow(params?: Record<string, string>) {
		// load the index.html of the app.
		if (!App.application.isPackaged) {
			const baseUrl = `http://localhost:${rendererAppPort}`;
			const fullUrl = this.generateFullUrl(baseUrl, params);
			App.mainWindow.loadURL(fullUrl);
		} else {
			const baseUrl = join(__dirname, '..', rendererAppName, 'index.html');
			App.mainWindow.loadURL(
				format({
					pathname: baseUrl,
					protocol: 'file:',
					slashes: true,
					query: params
				})
			);
		}

		App.application.setAppUserModelId('mezon.ai');
	}

	static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
		App.BrowserWindow = browserWindow;
		App.application = app;

		App.application.on('window-all-closed', App.onWindowAllClosed);
		App.application.on('ready', App.onReady);
		App.application.on('activate', App.onActivate);
	}

	/**
	 * setup receive notification from FCM
	 */
	private static setupPushReceiver() {
		return setupPushReceiver(App.mainWindow.webContents);
	}

	/**
	 * setup badge for the app
	 */
	private static setupBadge() {
		return initBadge(App.application, App.mainWindow);
	}

	private static setupMenu() {
		const isMac = process.platform === 'darwin';

		const appMenu: MenuItemConstructorOptions[] = [
			{
				label: app.name,
				submenu: [
					{ role: 'about' },
					{ label: 'Check for Updates...', click: () => autoUpdater.checkForUpdates() },
					{ type: 'separator' },
					{
						type: 'normal',
						label: 'Settings...',
						accelerator: 'CmdOrCtrl+,',
						click: () => App.mainWindow.webContents.send(TRIGGER_SHORTCUT, 'CmdOrCtrl+,')
					},
					{ type: 'separator' },
					{ role: 'services' },
					{ type: 'separator' },
					{ role: 'hide' },
					{ role: 'hideOthers' },
					{ role: 'unhide' },
					{ type: 'separator' },
					{ role: 'quit' }
				]
			}
		];

		const template: MenuItemConstructorOptions[] = [
			// { role: 'appMenu' }
			...(isMac ? appMenu : []),
			// { role: 'fileMenu' }
			{
				label: 'File',
				submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
			},
			// { role: 'editMenu' }
			{
				label: 'Edit',
				submenu: [
					{ role: 'undo' },
					{ role: 'redo' },
					{ type: 'separator' },
					{ role: 'cut' },
					{ role: 'copy' },
					{ role: 'paste' },
					...(isMac
						? ([
								{ role: 'pasteAndMatchStyle' },
								{ role: 'delete' },
								{ role: 'selectAll' },
								{ type: 'separator' },
								{
									label: 'Speech',
									submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
								}
							] as MenuItemConstructorOptions[])
						: ([{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }] as MenuItemConstructorOptions[]))
				]
			},
			// { role: 'viewMenu' }
			{
				label: 'View',
				submenu: [
					{ role: 'reload' },
					{ role: 'forceReload' },
					{ type: 'separator' },
					{ role: 'resetZoom' },
					{ role: 'zoomIn' },
					{ role: 'zoomOut' },
					{ type: 'separator' },
					{ role: 'togglefullscreen' }
				]
			},
			// { role: 'windowMenu' }
			{
				label: 'Window',
				submenu: [
					{ role: 'minimize' },
					{ role: 'zoom' },
					...(isMac
						? ([{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }] as MenuItemConstructorOptions[])
						: ([{ role: 'close' }] as MenuItemConstructorOptions[]))
				]
			},
			{
				role: 'help',
				submenu: [
					{
						label: 'Learn More',
						click: async () => {
							await shell.openExternal('https://mezon.ai');
						}
					}
				]
			}
		];

		const menu = Menu.buildFromTemplate(template);
		Menu.setApplicationMenu(menu);
	}
}
