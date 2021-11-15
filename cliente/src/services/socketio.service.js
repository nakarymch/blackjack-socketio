import { io } from 'socket.io-client';

class SocketioService {
  socket;
  constructor() {}

  setupSocketConnection() {
    this.socket = io(process.env.VUE_APP_SOCKET_ENDPOINT);
  }

  connectToGame() {
    this.socket.emit('join:game');
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketioService();