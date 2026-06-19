<template>
  <div class="bg-card border-b border-border overflow-hidden">
    <div class="flex items-center space-x-8 py-3 px-4 animate-marquee whitespace-nowrap">
      <span class="text-text-muted text-sm">Premium HD streaming — 100% free. No signup required.</span>
      <span class="text-primary text-sm">•</span>
      <span class="text-text-muted text-sm">Watch live sports in HD quality</span>
      <span class="text-primary text-sm">•</span>
      <span class="text-text-muted text-sm">Multiple server options</span>
      <span class="text-primary text-sm">•</span>
      <span class="text-text-muted text-sm">No ads, no interruptions</span>
      <span class="text-primary text-sm">•</span>
      <span class="text-text-muted text-sm">Premium HD streaming — 100% free. No signup required.</span>
      <span class="text-primary text-sm">•</span>
      <span class="text-text-muted text-sm">Watch live sports in HD quality</span>
      <span class="text-primary text-sm">•</span>
      <span class="text-text-muted text-sm">Multiple server options</span>
      <span class="text-primary text-sm">•</span>
      <span class="text-text-muted text-sm">No ads, no interruptions</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}
</style>
