<template>
    <span
      class="bank"
    >
      <span v-if="extra" style="margin-top: -8px;">:</span><span class="number">{{ number }}</span>
    </span>
</template>

<script>
export default {
  props: {
    extra: {
      type: Number,  
      required: false 
    },
    number: {
      type: Number, 
      required: true 
    }  
  }
}
</script>

<style scoped>
.bank {
  background: rgba(0, 0, 0, 0.1);
    height: 4rem;
    display: inline-flex;
    padding: 1rem;
    justify-content: center;
    align-items: center;
    border-radius: 30px;
    font-weight: 500;
    font-size: 3rem;
    transition: all 0.2s ease;
    color: rgb(239, 240, 252);
    min-width: 5rem;
    margin: 0 15px;
}
.bank small {
  font-size: 2rem;
  font-weight: 300;
  margin: 0.5rem;
}
.bank.is-increasing {
  background: rgba(0, 0, 0, 0.2);
}
.bank .number {
  transition: all 0.2s ease;
}
.bank.is-increasing .number {
  transform: scale(1.1);
}
.is-spinning {
  animation: spin 1s ease;
  transform-origin: center;
  transform-box: fill-box;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
@keyframes spin {
  0% {
    transform: rotateY(0);
  }
  100% {
    transform: rotateY(2160deg);
  }
}
</style>
