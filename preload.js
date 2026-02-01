const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLogFiles: () => ipcRenderer.invoke('get-log-files'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath)
});
