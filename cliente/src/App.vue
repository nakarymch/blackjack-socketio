<template>
  <div id="app" class="game">
    <game-sidebar />
    <game-view />
  </div>
</template>

<script>
import SocketioService from './services/socketio.service.js';
import GameView from './components/GameView';
import GameSidebar from './components/GameSidebar'; 

export default {
  name: 'App',
  components: { GameView, GameSidebar },
  created () {
    SocketioService.setupSocketConnection();
    SocketioService.connectToGame();
  },
  //beforeDestroy () {
  //  SocketioService.disconnect();
  //}
}
</script>

<style>
* {
  font-family: 'Oxygen', sans-serif;
}
.game {
  display: flex;
  flex-flow: row nowrap;
}
html, body, .game {
  height: 100%;
  overflow: hidden;
  margin: 0;
}
html {
  font-size: 16px;
}
@media (max-height: 768px) {
  html {
  font-size: calc(5px + 0.5vh);
  }
}
body {
  background: #3f6fc2;
  font-family: 'Helvetica', 'Arial', sans-serif;
}
:focus {
  outline: 0 !important;
}
* {
  user-select: none;
}
.text-red {
  color: #E04030;
}
.text-secondary-color {
  color: rgb(12, 36, 48);
}
.text-gold {
  color: #E1AE0F;
}
.text-white {
  color: rgb(239, 240, 252);
}
</style>
