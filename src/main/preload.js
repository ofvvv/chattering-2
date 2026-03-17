import { contextBridge, ipcRenderer } from 'electron';

// Exponer APIs seguras al proceso de renderizado (frontend)
// bajo el objeto global `window.electronAPI`
contextBridge.exposeInMainWorld('electronAPI', {
  // Ejemplo: una función que el frontend puede invocar para obtener la versión de la app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Aquí expondremos los métodos para enviar y recibir eventos
  // desde los proveedores de chat hacia la UI. Por ejemplo:
  onChatMessage: (callback) => ipcRenderer.on('chat:message', (_event, message) => callback(message)),

  // Función para remover el listener y evitar memory leaks
  removeChatMessageListener: () => ipcRenderer.removeAllListeners('chat:message'),

  // Podríamos añadir más listeners para otros eventos como:
  // onUserJoined: (callback) => ipcRenderer.on('user:joined', (_event, user) => callback(user)),
  // onStreamEvent: (callback) => ipcRenderer.on('stream:event', (_event, event) => callback(event)),
});
