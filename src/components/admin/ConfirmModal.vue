<template>
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="$emit('cancel')"
      @keydown.esc="$emit('cancel')"
    >
      <div class="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div class="shrink-0 w-11 h-11 rounded-full flex items-center justify-center" :class="tones[tone].iconWrap">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="tones[tone].icon" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-white font-bold text-lg leading-snug">{{ title }}</h3>
              <p class="text-text-muted text-sm mt-1.5 leading-relaxed">{{ message }}</p>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 bg-surface/40 border-t border-border">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-white border border-border hover:border-border-strong transition-colors"
          >
            {{ cancelText }}
          </button>
          <button
            ref="confirmBtn"
            @click="$emit('confirm')"
            class="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            :class="tones[tone].btn"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  // 'danger' | 'warning' | 'primary'
  tone: { type: String, default: 'danger' }
})
defineEmits(['confirm', 'cancel'])

const confirmBtn = ref(null)

const tones = {
  danger: {
    iconWrap: 'bg-red-500/15 text-red-400',
    btn: 'bg-red-500 hover:bg-red-600',
    icon: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'
  },
  warning: {
    iconWrap: 'bg-amber-500/15 text-amber-400',
    btn: 'bg-amber-500 hover:bg-amber-600',
    icon: 'M4 4v6h6M20 20v-6h-6M20 9A8 8 0 0 0 5.6 5.6L4 7M4 15a8 8 0 0 0 14.4 3.4L20 17'
  },
  primary: {
    iconWrap: 'bg-primary/15 text-primary-light',
    btn: 'bg-primary hover:bg-primary-dark',
    icon: 'M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
  }
}

// Focus the confirm button when the dialog opens (Enter confirms, Esc cancels).
watch(() => props.open, async (v) => {
  if (v) { await nextTick(); confirmBtn.value?.focus() }
})
</script>
