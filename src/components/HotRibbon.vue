<template>
  <div
    class="absolute top-0 w-[92px] h-[92px] overflow-hidden pointer-events-none z-20"
    :class="side === 'right' ? 'right-0' : 'left-0'"
  >
    <div
      class="absolute top-[16px] w-[140px] py-1 text-center text-[10px] font-extrabold tracking-widest text-white shadow-md bg-gradient-to-r from-red-600 via-red-500 to-rose-500"
      :class="side === 'right' ? 'right-[-34px] rotate-45' : 'left-[-34px] -rotate-45'"
    >
      HOT
    </div>
  </div>
</template>

<script setup>
defineProps({
  side: { type: String, default: 'left' }, // 'left' | 'right'
})
</script>
