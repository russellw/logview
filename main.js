const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let logDirectory = process.cwd();

// Parse command line arguments for directory path
// Skip electron binary and app path
const args = process.argv.slice(app.isPackaged ? 1 : 2);
if (args.length > 0 && !args[0].startsWith('-')) {
  logDirectory = path.resolve(args[0]);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('dist/index.html');
  mainWindow.maximize();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-log-files', async () => {
  try {
    const files = await fs.promises.readdir(logDirectory);
    const logFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.txt' || ext === '.log';
    });
    return {
      directory: logDirectory,
      files: logFiles.map(file => ({
        name: file,
        path: path.join(logDirectory, file)
      }))
    };
  } catch (err) {
    console.error('Error reading directory:', err);
    return { directory: logDirectory, files: [], error: err.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('rename-file', async (event, oldPath, newName) => {
  try {
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);
    await fs.promises.rename(oldPath, newPath);
    return { success: true, newPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
