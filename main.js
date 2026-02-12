const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron');
const path = require('path');
const Storage = require('./src/storage');

// Initialize storage
const storage = new Storage({
    configName: 'user-preferences',
    defaults: {
        urls: []
    }
});

let mainWindow;
let tray = null;
const overlays = new Map(); // Store overlay windows by ID

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'resources/icon.ico'),
        title: 'WinOnTop',
        autoHideMenuBar: true,
        show: false, // Wait for ready-to-show
        backgroundColor: '#f4f4f5' // Default to light theme bg to blend in
    });

    mainWindow.loadFile('src/index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createOverlayWindow(urlItem) {
    if (overlays.has(urlItem.id)) {
        const existing = overlays.get(urlItem.id);
        if (existing) {
            existing.show();
            existing.focus();
            return existing;
        }
    }

    const { width, height } = urlItem;

    const overlay = new BrowserWindow({
        width: width || 480,
        height: height || 720,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        },
        skipTaskbar: true
    });

    // Elevate priority to stay on top of full-screen games/apps
    overlay.setAlwaysOnTop(true, 'screen-saver', 1);
    overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Load overlay HTML
    overlay.loadFile('src/overlay.html', { query: { id: urlItem.id, url: urlItem.url } });

    // Handle aspect ratio
    // Force aspect ratio based on initial width/height
    if (width && height) {
        overlay.setAspectRatio(width / height);
    }

    overlay.on('closed', () => {
        overlays.delete(urlItem.id);
    });

    overlays.set(urlItem.id, overlay);
    return overlay;
}

function createTray() {
    try {
        const iconPath = path.join(__dirname, 'resources/icon.ico');
        tray = new Tray(iconPath);

        const contextMenu = Menu.buildFromTemplate([
            { label: 'Open App', click: () => mainWindow.show() },
            {
                label: 'Quit', click: () => {
                    app.isQuitting = true;
                    app.quit();
                }
            }
        ]);

        tray.setToolTip('WinOnTop');
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            mainWindow.show();
        });
    } catch (err) {
        console.error('Failed to create tray icon:', err);
    }
}


// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createTray();
        createMainWindow();
        // createTray(); // Delay tray creation until I have an icon, or handle error. 
        // Actually, Prompt says "App lives in system tray". I MUST implement it.
        // I'll create a simple empty file for icon or use generated one later.

        // IPC Handlers
        ipcMain.handle('get-urls', () => {
            console.log('IPC: get-urls called');
            return storage.getUrls();
        });

        ipcMain.handle('add-url', (event, urlItem) => {
            console.log('IPC: add-url', urlItem);
            storage.addUrl(urlItem);
            return storage.getUrls();
        });

        ipcMain.handle('delete-url', (event, id) => {
            console.log('IPC: delete-url', id);
            storage.removeUrl(id);
            return storage.getUrls();
        });

        ipcMain.handle('update-url-size', (event, id, width, height) => {
            console.log('IPC: update-url-size', id, width, height);
            const urls = storage.getUrls();
            const item = urls.find(u => u.id === id);
            if (item) {
                item.width = width;
                item.height = height;
                storage.set('urls', urls);
            }
            return storage.getUrls();
        });

        ipcMain.handle('open-overlay', (event, id) => {
            console.log('IPC: open-overlay', id);
            const item = storage.getUrls().find(u => u.id === id);
            if (item) {
                const overlayWin = createOverlayWindow(item);

                // Mouse Polling for Auto-Hide Reliability
                // Webviews eat mouse events, so we poll mouse position from main process
                const pollInterval = setInterval(() => {
                    if (!overlayWin || overlayWin.isDestroyed()) {
                        clearInterval(pollInterval);
                        return;
                    }

                    const point = screen.getCursorScreenPoint();
                    const bounds = overlayWin.getBounds();

                    // Electron's getCursorScreenPoint returns DIPs on Windows (usually).
                    // getBounds also returns DIPs.
                    // However, let's ensure we are robust.
                    // A buffer of 1px might help with edge cases.

                    const isInside =
                        point.x >= bounds.x &&
                        point.x < bounds.x + bounds.width &&
                        point.y >= bounds.y &&
                        point.y < bounds.y + bounds.height;

                    // Send status to renderer
                    // Only send if state CHANGED to avoid flooding renderer?
                    // Renderer receiving same boolean is fine, but optimization:
                    // We don't have previous state here easily without wider scope.
                    // Let's just send it.
                    if (!overlayWin.isDestroyed()) {
                        // console.log(`Polling ${id}: inside=${isInside}`); // Debug
                        overlayWin.webContents.send('overlay-hover-update', isInside);
                    }

                }, 1000); // Check every 1000ms (1 second)

                overlayWin.on('closed', () => clearInterval(pollInterval));
            }
        });

        ipcMain.on('overlay-ignore-mouse', (event, shouldIgnore, windowId) => {
            // Find the window. windowId is sent from renderer.
            // Wait, I need to know WHICH window.
            // The sender webContents can help.
            const win = BrowserWindow.fromWebContents(event.sender);
            if (win) {
                win.setIgnoreMouseEvents(shouldIgnore, { forward: true });
            }
        });

        ipcMain.handle('app-quit', () => {
            app.isQuitting = true;
            app.quit();
        });

        ipcMain.handle('get-startup', () => {
            return app.getLoginItemSettings().openAtLogin;
        });

        ipcMain.handle('toggle-startup', (event, enable) => {
            app.setLoginItemSettings({
                openAtLogin: enable,
                path: app.getPath('exe')
            });
            return app.getLoginItemSettings().openAtLogin;
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
        });
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            // Do not quit, keep tray active?
            // Prompt says "Closing main window... minimizes to system tray".
            // "Quit App" in tray quits.
        }
    });
}
