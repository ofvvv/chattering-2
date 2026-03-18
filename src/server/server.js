import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Recreamos __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// 1. Configuración de Rutas Estáticas (El arreglo al error de la IA)
// Le decimos a Express que TODO lo que está en /public es de acceso libre
const publicPath = path.join(__dirname, '../../public');
app.use(express.static(publicPath));

// Ruta principal: Redirige directamente al index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'html/index.html'));
});

// 2. Cargador Dinámico de Providers (El Framework)
async function loadProviders() {
    const providersPath = path.join(__dirname, '../providers');
    
    // Si la carpeta no existe, la crea para que no crashee
    if (!fs.existsSync(providersPath)) fs.mkdirSync(providersPath, { recursive: true });

    const files = fs.readdirSync(providersPath).filter(file => file.endsWith('.js'));
    
    console.log(`[Framework] Encontrados ${files.length} proveedores.`);
    
    for (const file of files) {
        try {
            // Importación dinámica (ESM)
            const module = await import(`../providers/${file}`);
            if (module.init) {
                module.init(io); // Le pasamos el socket al proveedor
                console.log(`[Framework] Proveedor cargado: ${file}`);
            }
        } catch (error) {
            console.error(`[Framework] Error cargando ${file}:`, error);
        }
    }
}

// 3. Inicio del Servidor
const PORT = 3000;
httpServer.listen(PORT, async () => {
    console.log(`🚀 Servidor base corriendo en http://localhost:${PORT}`);
    await loadProviders();
});

// Evento de prueba del Socket
io.on('connection', (socket) => {
    console.log('🟢 Frontend conectado al socket');
});