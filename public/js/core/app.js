const socket = io();

const chatContainer = document.getElementById('chat-container');
const connectBtn = document.getElementById('connect-btn');
const channelInput = document.getElementById('channel-input');

console.log('Conectando a Socket.io...');

socket.on('connect', () => {
  console.log('Conectado al servidor con ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor.');
});

// Escuchar el evento 'chat:message' que viene del backend
socket.on('chat:message', (event) => {
  console.log('Mensaje de chat recibido:', event);
  appendMessage(event);
});

// Añadir listener al botón de conexión
connectBtn.addEventListener('click', () => {
  const channel = channelInput.value.trim();
  if (channel) {
    // Emitir el canal al servidor
    socket.emit('channel:connect', { channel: `#${channel}` });
    console.log(`Solicitando conexión al canal: #${channel}`);
  }
});

// Función para añadir el mensaje al DOM
function appendMessage(event) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `provider-${event.provider}`);

  const timestamp = new Date(event.timestamp).toLocaleTimeString();

  // Estilo básico para el nombre de usuario
  const userNameStyle = event.user.color ? `color: ${event.user.color}` : '';

  messageElement.innerHTML = `
    <span class="timestamp">${timestamp}</span>
    <span class="username" style="${userNameStyle}"><strong>${event.user.name}:</strong></span>
    <span class="content">${event.message}</span>
  `;

  chatContainer.appendChild(messageElement);

  // Auto-scroll hacia el último mensaje
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
