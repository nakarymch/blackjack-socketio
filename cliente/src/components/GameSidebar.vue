<template>
  <aside class="sidebar">
    <div>
      <ul>
        <li>
          <span><strong>Usuario</strong></span> <span>Turno</span>
        </li>
        <li
          v-for="user in users"
          :key="user.id"
        >
          <span><strong>{{user.socket}}</strong></span> <span :class="{'green-point' : user.turn, 'red-point' : !user.turn }"></span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
import SocketioService from '../services/socketio.service.js';

export default {
  data() {
    return {
        users: []
    }
  },
  mounted() {
    SocketioService.getSocket().on('game:users', (users) => {
      this.users = users 
    })
  },
  methods: {
    cleanUser() {
      SocketioService.getSocket().emit('game:clean:users')
    }
  }
}
</script>

<style scoped>
.sidebar {
  display: flex !important;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 320px;
  font-size: 1rem;
  z-index: 100;
  background: rgb(12, 36, 48);;
  height: 100%;
  transition: transform 0.2s ease-in;
  color: rgb(239, 240, 252);
}
@media (max-width: 1199px) {
  .sidebar {
    position: absolute;
    transform: translateX(-320px);
  }
  .sidebar.open {
    transform: translateX(0px);
  }
}
.tagline {
  text-transform: uppercase;
  letter-spacing: 0.1rem;
}
.sidebar #logo {
  width: 85%;
}
.sidebar p {
  margin: 1rem 0;
  text-align: center;
}
.sidebar p a {
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.sidebar p a:hover {
  border-color: rgb(239, 240, 252);
}
.toggle {
  display: flex;
  align-items: center;
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  padding: 1rem;
  opacity: 0.85;
  font-size: 1.2rem;
}
.toggle:hover {
  opacity: 1;
}
.toggle svg {
  height: 24px;
  width: 24px;
  padding-right: 8px;
}
.footer {
  position: absolute;
  bottom: 0;
  opacity: 0.85;
}

ul {
  list-style: none;
  padding: 25px;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

aside > div {
  width: 100%;
}

.green-point, .red-point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 13px;
}

.green-point {
  background: rgb(51, 161, 99);
}

.red-point {
  background: #E04030;
}
</style>
