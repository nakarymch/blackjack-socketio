<template>
  <main class="game-area">
    <section class="dealer-side">
      <game-hand
        :hand="dealerHand"
      />
    </section>
    <section class="player-side">
      <game-hand
        :hand="userHand"
        v-if="!endGame"
      />
      <div v-else style="font-size: 25px; color: rgb(239, 240, 252);" v-html="text"></div>

    </section>

    <game-controls 
      @hit="hitCard"
      @stand="stand"
      :is-player-turn="isPlayerTurn"
      :is-blackjack="isBlackJack"
      :points="points"
      :seconds="time"
    />
  </main>
</template>

<script>
import SocketioService from '../services/socketio.service.js';
import GameHand from './Game/GameHand'
import GameControls from './Game/GameControls'

export default {
  components: {
    GameHand,
    GameControls
  },
  computed: {

  },
  mounted() {

    SocketioService.getSocket().on('message', (json) => {
      let data = JSON.parse(json);
      let card, cards, values, score, autowin;
      switch (parseInt(data.Tipo)) {
        case -1:
          alert("No se permiten más usuarios o la partida ya empezó");
          break; 
        case 2: // star Game
          //
          this.dealerHand = {
            "cards": [],
            "total": 0,
            "result": ''
          };
          this.userHand = {
            "cards": [],
            "total": 0,
            "result": ''
          };
          this.isBlackJack = false;

          if (data.Valor != undefined) {
            this.startGame();
          }

          break;
        case 3: // 
          // round##user##card.value##card.suit
          card = data.Valor.split("##"); 
          this.storeCard(card)
          break;
        case 4:
          this.endGame = false;
          // round##card.value##card.value##card.suit##card.suit
          cards = data.Valor.split("##"); 
          this.storeCard([cards[0], 'user', cards[1], cards[3]]);
          this.storeCard([cards[0], 'user', cards[2], cards[4]]);
          break;
        case 5:
          // round
          this.isPlayerTurn = data.Turn;
          if (data.Turn) {
            this.time = 10;
            this.interval = setInterval( ()=> {
              if ( --this.time == 0 ) {
                clearInterval(this.interval); 
                SocketioService.getSocket().emit('message', JSON.stringify({
                  Tipo: 7
                }))
              }
            }, 1000)
          }
          break;
        case 6:
          // round##card.value##card.suit
          card = data.Valor.split("##"); 
          this.storeCard([card[0], 'user', card[1], card[2]]);
          break;
        case 9: // user:score   
          // score##init
          values = data.Valor.split('##');
          values = {
            score: parseInt(values[0]),
            init: eval(values[1])
          }

          this.userHand.total = values.score;
          if ( values.score >= 21 ) {         
            if ( values.score == 21 ) {
              this.userHand.result = 'blackjack';
              this.isBlackJack = true;
              this.points++
            } else {
              if(!values.init) {
                SocketioService.getSocket().emit('message', JSON.stringify({
                  Tipo: 7
                }))
              }
              this.userHand.result = 'lose';
              clearInterval(this.interval);
            }
          }
          break;
        case 10: // dealer:score
          score = data.Valor;
          this.dealerHand.total = parseInt(score);
          if ( score == 21 ) {
            this.dealerHand.result = 'blackjack';
          } else if (score >= 21) {
            this.dealerHand.result = 'lose';
          }
          break;  
        case 7: // game:deal:dealer - end round
          autowin = eval(data.Valor);
          this.dealerHand.cards.map(c => c.isFaceDown = false)
          if (!autowin) {
            for ( let x = 0; x < 20; x++ ) {
              // validate
              SocketioService.getSocket().emit('message', JSON.stringify({
                Tipo: 9
              }))
            }
          }
          SocketioService.getSocket().emit('message', JSON.stringify({
            Tipo: 10
          }))
          break;
        case 11: // dealer win
          if (this.dealerHand.result == '') {
            this.dealerHand.result = 'win';
          }
          break;
        case 12:
          this.dealerHand.cards.map(c => c.isFaceDown = false)
          this.dealerHand.result = 'lose';
          break;  
        case 13:
          this.userHand.result = 'lose';
          break;
        case 14:
          if (this.userHand.result == '') {
            this.userHand.result = 'win';
            this.points++
          }
          break;  
        case 8:
          this.endGame = true;
          this.isPlayerTurn = false;

          this.text = '<strong>Ganadores:</strong> <br />';
          data.Valor.map((winner) => {
            if (winner.user_id == 'crepier') {
              this.text += 'Dealer:  <strong>' + winner.points + '</strong>';
            } else {
              this.text += winner.socket + ': <strong>' + winner.points + '</strong>' ;
            }
            this.text += '<br />';
          })
          break;  
      }
    });
  },
  data () {
      return {
        dealerHand: {
            "cards": [],
            "total": 0,
            "result": ''
        },
        userHand: {
          "cards": [],
          "total": 0,
          "result": ''
        },
        users: '',
        isPlayerTurn: false,
        isBlackJack: false,
        time: 10,
        interval: null,
        points: 0,
        endGame: true,
        text: 'Bienvenido, espera unos segundos...'
      }
  },
  methods: {
    storeCard(card) {
      if (card[1] == 'crepier') {
        let isFaceDown = true;

        if (this.dealerHand.cards.length > 0) isFaceDown = false;
        this.dealerHand.cards.push({
          "value": card[2],
          "suit": card[3],
          "isFaceDown": isFaceDown
        });
      } else {
        this.userHand.cards.push({
          "value": card[2],
          "suit": card[3],
          "isFaceDown": false
        });
      }
    },
    startGame () { 
     SocketioService.getSocket().emit('message', JSON.stringify({
        Tipo: 2,
        Valor: ''
      }));
    },
    hitCard () {
      SocketioService.getSocket().emit('message', JSON.stringify({
        Tipo: 6
      }))
    },
    stand () {
      clearInterval(this.interval);
      SocketioService.getSocket().emit('message', JSON.stringify({
        Tipo: 7
      }))
    },
    cleanUser() {
      SocketioService.getSocket().emit('game:clean:users');
    }
  }
}
</script>

<style scoped>
.game-area {
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  z-index: 50;
}
.is-dimmed {
  opacity: 0.5;
}
.no-pointer-events {
  pointer-events: none;
}
.dealer-side {
  margin-top: 2rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  min-height: 12.4rem;
}
.player-side {
  flex: 1 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
}
</style>
