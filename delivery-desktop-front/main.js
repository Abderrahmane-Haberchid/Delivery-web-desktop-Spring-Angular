const { app, BrowserWindow, screen } = require('electron'); // Import screen module
const path = require('path');

let mainWindow; // Declare mainWindow in the global scope

function createWindow() {
  // Get the primary display's size
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width, // Set width to 100% of the screen
    height: height, // Set height to 100% of the screen
    fullscreen: false, // Optional: Use if you want fullscreen mode
    resizable: false, // Prevent resizing
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL('http://localhost:4200'); // Load your Angular app
  // mainWindow.webContents.openDevTools(); // Open DevTools (optional)
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  screen.on('display-metrics-changed', (event, display, changedMetrics) => {
    if (changedMetrics.includes('workAreaSize')) {
      const { width, height } = display.workAreaSize;
      if (mainWindow) {
        mainWindow.setSize(width, height); // Resize the window
      }
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
