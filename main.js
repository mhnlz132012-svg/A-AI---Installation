/* A-AI v1.1 Main Window Launcher (main.js) */

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let splashWindow = null;
let mainWindow = null;

function getSplashFile() {
  const targets = ['loading.html', 'loading.html.txt', 'loading-html.txt'];
  for (const target of targets) {
    const fullPath = path.join(__dirname, target);
    if (fs.existsSync(fullPath)) {
      return target;
    }
  }
  return null;
}

function getLaunchFile() {
  // Prefer the patched desktop-index.html if it exists, otherwise fall back to original index.html
  if (fs.existsSync(path.join(__dirname, 'desktop-index.html'))) {
    return 'desktop-index.html';
  }
  return 'index.html';
}

function createWindows() {
  const splashFile = getSplashFile();

  if (splashFile) {
    splashWindow = new BrowserWindow({
      width: 480,
      height: 380,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      show: false,
      icon: path.join(__dirname, 'logo.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    splashWindow.loadFile(splashFile);
    splashWindow.once('ready-to-show', () => {
      splashWindow.show();
    });
    splashWindow.setMenu(null);
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: "A-AI v1.1",
    fullscreen: true, // Auto fullscreen locked!
    icon: path.join(__dirname, 'logo.png'),
    backgroundColor: "#ffffff",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Block native right-click context menus at window level
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  Menu.setApplicationMenu(null);
  mainWindow.setMenu(null);
  
  const launchFile = getLaunchFile();
  mainWindow.loadFile(launchFile);

  // Prevent index.html post-load title overrides on taskbar
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  const delayTime = splashFile ? 4000 : 0;

  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
  }, delayTime);
}

app.whenReady().then(() => {
  createWindows();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
