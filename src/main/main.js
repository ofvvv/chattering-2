import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar nuestro servidor para que se inicie junto con la app
import '../server/server.js';

// Replicar __dirname y __filename en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Configuración de la ventana principal
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Adjuntar el script de preload
      preload: path.join(__dirname, 'preload.js'),
      // Es crucial mantener contextIsolation y deshabilitar nodeIntegration
      // por seguridad. La comunicación se hará vía preload.
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Cargar el archivo HTML del frontend
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'public', 'html', 'index.html'));

  // Opcional: Abrir las DevTools para depuración
  // mainWindow.webContents.openDevTools();
}

// Este método se llamará cuando Electron haya finalizado
// la inicialización y esté listo para crear ventanas del navegador.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // En macOS es común volver a crear una ventana en la aplicación cuando el
    // icono del dock es presionado y no hay otras ventanas abiertas.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Ejemplo de un manejador IPC en el proceso principal
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
