<template>
  <div ref="box" class="overflow-hidden">
    <div
      class="whitespace-nowrap"
      :class="overflowing ? 'inline-flex marquee' : 'inline-block max-w-full align-bottom'"
    >
      <span ref="item" :class="overflowing ? 'pr-12' : ''">{{ text }}</span>
      <span v-if="overflowing" class="pr-12" aria-hidden="true">{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({ text: { type: String, default: '' } })

const box = ref(null)
const item = ref(null)
const overflowing = ref(false)
let ro = null

// Scroll only when the text doesn't fit. Reset first so we measure the single
// (non-duplicated) copy, then compare against the container width.
const measure = async () => {
  overflowing.value = false
  await nextTick()
  if (!box.value || !item.value) return
  overflowing.value = item.value.scrollWidth > box.value.clientWidth + 1
}

onMounted(() => {
  measure()
  if (window.ResizeObserver && box.value) {
    ro = new ResizeObserver(() => measure())
    ro.observe(box.value)
  }
})
onBeforeUnmount(() => ro && ro.disconnect())
watch(() => props.text, measure)
</script>

<style scoped>
.marquee {
  animation: fm-marquee 12s linear infinite;
}
@keyframes fm-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>
