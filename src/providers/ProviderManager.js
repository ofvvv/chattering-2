import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProviderManager {
  constructor() {
    this.providers = {};
  }

  async loadProviders() {
    const providersPath = __dirname;
    const providerDirs = await readdir(providersPath, { withFileTypes: true });

    for (const dir of providerDirs) {
      if (dir.isDirectory()) {
        const providerName = dir.name;
        try {
          const modulePath = path.join(providersPath, providerName, 'index.js');
          const moduleUrl = pathToFileURL(modulePath).href;
          const providerModule = await import(moduleUrl);
          this.providers[providerName] = providerModule.default;
          console.log(`Módulo '${providerName}' cargado exitosamente.`);
        } catch (error) {
          console.error(`Error al cargar el módulo '${providerName}':`, error);
        }
      }
    }
  }

  // Pasamos el callback 'onEvent' al constructor del proveedor
  connectProvider(providerName, options, onEvent) {
    const Provider = this.providers[providerName];
    if (Provider) {
      const providerInstance = new Provider(options, onEvent);
      providerInstance.connect();
      return providerInstance;
    } else {
      console.error(`Proveedor '${providerName}' no encontrado.`);
    }
  }
}

export default new ProviderManager();
