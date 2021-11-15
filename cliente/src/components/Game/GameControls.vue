<template>
  <div class="controls-row">
    <div class="controls">      
      <game-button
        action="stand"
        :is-enabled="isPlayerTurn"
      />
      <points :number="points" :extra="false"/>
      <points :number="seconds" :extra="true"/>
      <game-button
        action="hit"
        :is-enabled="isPlayerTurn && !isBlackjack"
      />
    </div>
  </div>
</template>

<script>
import GameButton from './GameButton'
import Points from './Points'

export default {
  props: {
    isPlayerTurn: {
      type: Boolean,
      required: true
    },
    isBlackjack: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number, 
      required: true 
    },
    seconds: {
      type: Number, 
      required: true 
    }
  },
  components: {
    GameButton,
    Points
    },
  computed: {
  }
}
</script>

<style scoped>
.controls-row {
  text-align: center;
}
.controls {
  display: inline-flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
