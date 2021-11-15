<template>
  <transition name="pop">
    <span
      v-if="total"
      class="hand-total"
      :class="{ 'bust': total > 21, 'twenty-one': total === 21 }">
      {{ total }}
    </span>
  </transition>
</template>

<script>
export default {
  props: {
    total: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped>
.hand-total {
  display: inline-block;
  position: absolute;
  top: -1.5rem;
  right: -1.5rem;
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 2em;
  background: rgb(239, 240, 252);
  border-radius: 50%;
  text-align: center;
  color: #0c2430;
}
.bust {
  background: #E04030;
}
.twenty-one {
  background: #E1AE0F;
}
.pop-enter-active {
  transition: all 0.3s ease-out;
}
.pop-leave-active {
  transition: all 0.1s ease-in;
}
.pop-enter, .pop-leave-to {
  transform: scale(0) rotate(360deg);
}
</style>
