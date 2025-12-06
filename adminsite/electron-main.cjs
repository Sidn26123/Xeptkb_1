// electron-main.cjs
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Xử lý logic hot-reload khi dev
const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true, // Cho phép dùng Node trong code nếu cần
            contextIsolation: false,
        },
    });

    if (isDev) {
        // KHI DEV: Load trang web từ server Vite (mặc định port 5173)
        // Bạn kiểm tra lại port vite của bạn có phải 5173 k nhé
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools(); // Mở sẵn khung F12 để debug
    } else {
        // KHI BUILD: Load file html đã đóng gói
        win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});