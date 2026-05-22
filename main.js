const { app, BrowserWindow, Tray, Menu, Notification, powerMonitor } = require('electron');
const path = require('path');
app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath
});
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) {
                win.restore();
            }
            win.show();
            win.focus();
        }
    });
}
function createWindow() {
    win = new BrowserWindow({
        width: 460,
        height: 760,
        resizable: false,
        maximizable: false,
        show: true,
        autoHideMenuBar: true,
        backgroundColor: '#0f0f0f',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile('index.html');
    win.once('ready-to-show', () => {
        win.show();
    });
    win.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            win.hide();
        }
    });
}
function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Spec Reminder',
            click: () => {
                win.show();
            }
        },
        {
            label: 'Hide',
            click: () => {
                win.hide();
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        },
        {
            label: 'Cancel Process',
            click: () => {
                win.webContents.executeJavaScript(`
            if(window.cancelProcess){
                window.cancelProcess();
            }
        `);
            }
        },
    ]);
    tray.setToolTip('Spec Reminder');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
        win.show();
    });
}

function showNotification() {
    new Notification({
        title: 'Spec Reminder',
        body: 'AI Eye Protection started successfully.'
    }).show();
}
app.whenReady().then(() => {
    app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: false
    });
    createWindow();
    createTray();
    showNotification();
    powerMonitor.on('resume', () => {
        console.log("System resumed");
        if (win) {
            win.show();
            win.focus();
            win.webContents.reload();
            new Notification({
                title: 'Spec Reminder',
                body: 'Please wear your protective glasses.'
            }).show();
        }
    });
    powerMonitor.on('unlock-screen', () => {
        console.log("Screen unlocked");
        if (win) {
            win.show();
            win.focus();
            win.webContents.reload();
        }
    });
});
app.on('window-all-closed', (e) => {
    e.preventDefault();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});