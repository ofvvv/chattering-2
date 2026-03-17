import tmi from 'tmi.js';

class TwitchProvider {
  // Aceptamos un callback 'onEvent' para notificar eventos
  constructor(options, onEvent) {
    this.onEvent = onEvent;
    this.client = new tmi.Client({
      options: { debug: false }, // Desactivamos el debug de tmi para no ensuciar la consola
      connection: {
        reconnect: true,
        secure: true
      },
      channels: [ options.channel ]
    });

    this.client.on('message', this.onMessageHandler.bind(this));
    this.client.on('connected', this.onConnectedHandler.bind(this));
  }

  connect() {
    this.client.connect().catch(console.error);
  }

  onMessageHandler(channel, userstate, message, self) {
    if (self) { return; } // Ignorar mensajes del propio bot

    // 1. Estandarizar el evento de mensaje
    const chatEvent = {
      provider: 'twitch',
      channel: channel.replace('#', ''),
      user: {
        name: userstate['display-name'],
        color: userstate['color'],
        badges: userstate['badges'],
      },
      message: message,
      timestamp: new Date().toISOString(),
    };

    // 2. Si el callback onEvent existe, lo invocamos con el evento
    if (this.onEvent) {
      this.onEvent(chatEvent);
    }
  }

  onConnectedHandler(addr, port) {
    console.log(`* Conectado a Twitch: ${addr}:${port}`);
  }
}

export default TwitchProvider;
