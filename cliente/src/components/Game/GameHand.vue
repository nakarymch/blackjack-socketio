<template>
  <div
    class="game-hand"
    
  >
    <transition-group name="deal" tag="div" class="cards">
        <card
          v-for="(card, i) in hand.cards"
          :key="i"
          :card="card"
          :isFaceDown="card.isFaceDown"
        />
    </transition-group>
    <hand-total :total="hand.total" />
    <hand-result :result="hand.result" />
  </div>
</template>

<script>
import Card from './GameHand/Card'
import HandTotal from './GameHand/HandTotal'
import HandResult from './GameHand/HandResult'

export default {
  components: {
    Card,
    HandTotal,
    HandResult
  },
  props: {
    hand: {
      type: Object,
      required: true
    }
  },
  computed: {
    
  },
  methods: {

  }
}
</script>

<style scoped>
.game-hand {
  position: relative;
  transition: transform 0.2s ease;
}
.game-hand.is-dealer, .game-hand.is-split {
  transform: scale(0.9);
}
.game-hand.is-active, .game-hand.is-split.is-active {
  position: absolute;
  max-width: 55%;
  transform: scale(1.3);
  z-index: 100;
}
.game-hand.is-split {
  transition: scale 0s;
}
.game-hand.is-inactive {
  opacity: 0.3;
  transform: translateY(-4rem);
}
.cards {
  min-height: 12.4rem;
  min-width: 8.4rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
}
.deal-enter-active {
  animation: deal 0.3s;
}
.deal-leave-active {
  animation: deal 0.3s reverse;
}
.is-split .deal-leave-active {
  animation-duration: 0;
}
@keyframes deal {
  0% {
    transform: translateY(-100vh);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
