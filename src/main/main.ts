/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { startObs } from '../js-script/app';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { spawn } from 'child_process';
import { Notification } from 'electron';

const currentGame = process.env.CURRENT_GAME;

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
  setTimeout(() => {
    console.log('Running JS script');
    startObs();
    new Notification({
      title: 'OBS process started!',
      body: 'Select a game and confirm to start!',
    }).show();
  }, 2000);
});

ipcMain.on('run-python-script', (event) => {
  try {
    const exePath = path.join(
      __dirname,
      '..',
      '..',
      // '..',
      // '..',  removes one path for running the app using pnpm dev

      'compiled-scripts',
      'py-script.exe',
    );
    if (isDebug) {
      console.log('Logging the path now');
      console.log(exePath);
    }

    const py = spawn(exePath, {
      env: { ...process.env }, // pass env variables to the Python script
    });
    py.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      event.reply('python-script-output', data.toString());
    });

    py.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      event.reply('python-script-error', data.toString());
    });

    py.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      console.log('Python script exited');
      event.reply('python-script-close', code);
    });
  } catch (err) {
    console.log(err);
  }
});

ipcMain.on('display-notification', async (event, message) => {
  // Function to show a notification
  function showNotification() {
    new Notification({
      title: 'Error encountered!',
      body: `${message}`,
    }).show();
  }

  // Call the function to show the notification
  showNotification();
});

ipcMain.on('change-game', async (event, game) => {
  try {
    // Set the environment variable
    process.env.CURRENT_GAME = game;
    const response = await fetch('http://localhost:4609/change-game');

    if (!response.ok) {
      console.log('Failed to change the game');
    } else {
      console.log(`Game changed to ${game}`);
    }
  } catch (error) {
    console.error('Error occurred while changing the game:', error);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    resizable: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  if (!isDebug) mainWindow.setMenu(null);

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
