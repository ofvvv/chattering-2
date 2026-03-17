import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import ProviderManager from '../providers/ProviderManager.js';

// Replicar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// La función que se pasará como callback a los proveedores.
// Esta función retransmite el evento a TODOS los frontends conectados.
const handleProviderEvent = (event) => {
  console.log('Retransmitiendo evento al frontend:', event);
  io.emit('chat:message', event);
};

io.on('connection', (socket) => {
  console.log('Frontend conectado:', socket.id);

  // Escuchar el evento 'channel:connect' que viene del frontend
  socket.on('channel:connect', (data) => {
    const { channel } = data;
    console.log(`Petición para conectar al canal: ${channel}`);
    
    // Conectamos el proveedor y le pasamos el manejador de eventos.
    ProviderManager.connectProvider(
      'twitch',
      { channel },
      handleProviderEvent
    );
  });

  socket.on('disconnect', () => {
    console.log('Frontend desconectado:', socket.id);
  });
});

httpServer.listen(PORT, async () => {
  await ProviderManager.loadProviders();
  console.log(`Servidor Express y Socket.io escuchando en el puerto ${PORT}`);
});

export { io };
