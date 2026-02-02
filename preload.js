const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLogFiles: () => ipcRenderer.invoke('get-log-files'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  renameFile: (oldPath, newName) => ipcRenderer.invoke('rename-file', oldPath, newName),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  appendDeletedLines: (lines) => ipcRenderer.invoke('append-deleted-lines', lines)
});
