const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al proceso de renderizado (frontend)
// bajo el objeto global \`window.electronAPI\`
contextBridge.exposeInMainWorld('electronAPI', {
  // Ejemplo: una función que el frontend puede invocar para obtener la versión de la app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Aquí expondremos los métodos para enviar y recibir eventos
  // desde los proveedores de chat hacia la UI. Por ejemplo:
  onChatMessage: (callback) => ipcRenderer.on('chat:message', (_event, message) => callback(message)),

  // Función para remover el listener y evitar memory leaks
  removeChatMessageListener: () => ipcRenderer.removeAllListeners('chat:message'),

  // Ejemplo de cómo el frontend podría enviar un evento al proceso principal
  // (aunque para conectar el canal usamos Socket.io directamente, esto es para futuras funcionalidades)
  send: (channel, data) => {
    // Lista blanca de canales seguros para enviar
    const validChannels = ['channel:connect'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
