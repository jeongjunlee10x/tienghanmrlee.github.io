'use strict';

const path = require('node:path');
const { app, BrowserWindow, Menu, shell, session } = require('electron');
const { HOME, classifyUrl } = require('./url-policy.cjs');

const WINDOW_TITLE = 'TIẾNG HÀN MR LEE';
const APP_ID = 'vn.mrlee.tienghan';
let mainWindow = null;

function openExternal(rawUrl) {
  if (classifyUrl(rawUrl) !== 'external') return;
  shell.openExternal(rawUrl).catch(error => {
    console.error('Cannot open external URL:', error.message);
  });
}

function goHome() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.loadURL(HOME);
}

function setApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: 'MR LEE',
      submenu: [
        { label: 'Trang chủ', accelerator: 'Alt+Home', click: goHome },
        { label: 'Mở website trong trình duyệt', click: () => openExternal(HOME + '?open=browser') },
        { type: 'separator' },
        { role: 'quit', label: 'Thoát' }
      ]
    },
    {
      label: 'Điều hướng',
      submenu: [
        { label: 'Quay lại', accelerator: 'Alt+Left', click: () => {
          if (mainWindow?.webContents.canGoBack()) mainWindow.webContents.goBack();
        } },
        { label: 'Tiến tới', accelerator: 'Alt+Right', click: () => {
          if (mainWindow?.webContents.canGoForward()) mainWindow.webContents.goForward();
        } },
        { label: 'Tải lại', accelerator: 'F5', click: () => mainWindow?.webContents.reload() },
        { type: 'separator' },
        { label: 'Toàn màn hình', accelerator: 'F11', click: () => {
          if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
        } },
        { role: 'resetZoom', label: 'Cỡ chữ mặc định' },
        { role: 'zoomIn', label: 'Phóng to' },
        { role: 'zoomOut', label: 'Thu nhỏ' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const win = new BrowserWindow({
    title: WINDOW_TITLE,
    width: 1440,
    height: 900,
    minWidth: 840,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#0b1636',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
      allowRunningInsecureContent: false,
      spellcheck: true
    }
  });
  mainWindow = win;

  // The web page must never gain access to Node.js or a privileged preload.
  win.webContents.on('will-attach-webview', event => event.preventDefault());

  // Block navigation to file://, javascript:, lookalike sites or HTTP.
  // External links go to the user's default browser.
  win.webContents.on('will-navigate', (event, url) => {
    const kind = classifyUrl(url);
    if (kind !== 'internal') {
      event.preventDefault();
      if (kind === 'external') openExternal(url);
    }
  });

  // No additional Electron windows, popups or Node-enabled renderer processes.
  win.webContents.setWindowOpenHandler(({ url }) => {
    const kind = classifyUrl(url);
    if (kind === 'internal') win.loadURL(url);
    else if (kind === 'external') openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-fail-load', (event, code, message, attemptedUrl, isMainFrame) => {
    if (isMainFrame && code !== -3 && classifyUrl(attemptedUrl) === 'internal') {
      console.error('MR LEE website could not load:', code, message);
      win.loadFile(path.join(__dirname, 'offline.html'));
    }
  });

  win.on('closed', () => { if (mainWindow === win) mainWindow = null; });
  win.loadURL(HOME);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId(APP_ID);

    // Only the official MR LEE origin can request media/notification permissions.
    // Audio recording is needed by pronunciation exercises; camera access is denied.
    session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => {
      if (classifyUrl(contents.getURL()) !== 'internal') return callback(false);
      if (permission === 'media') {
        const types = details?.mediaTypes || [];
        return callback(types.includes('audio') && !types.includes('video'));
      }
      return callback(['notifications', 'clipboard-sanitized-write', 'fullscreen'].includes(permission));
    });

    setApplicationMenu();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
