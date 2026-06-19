<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 animate-pulse">
    <div class="relative p-6">
      <!-- Top Badges -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <div class="w-16 h-6 bg-slate-700/50 rounded-full"></div>
          <div class="w-16 h-6 bg-slate-700/50 rounded-full"></div>
        </div>
        <div class="w-16 h-6 bg-slate-700/50 rounded-full"></div>
      </div>

      <!-- Teams Section -->
      <div class="flex items-center justify-between mb-6">
        <!-- Home Team -->
        <div class="flex-1 text-center">
          <div class="w-16 h-16 mx-auto mb-3 bg-slate-800/50 rounded-2xl"></div>
          <div class="w-20 h-4 bg-slate-700/50 rounded mx-auto"></div>
        </div>

        <!-- VS -->
        <div class="px-4">
          <div class="w-8 h-6 bg-slate-700/50 rounded mx-auto"></div>
        </div>

        <!-- Away Team -->
        <div class="flex-1 text-center">
          <div class="w-16 h-16 mx-auto mb-3 bg-slate-800/50 rounded-2xl"></div>
          <div class="w-20 h-4 bg-slate-700/50 rounded mx-auto"></div>
        </div>
      </div>

      <!-- Bottom Info -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <div class="w-32 h-3 bg-slate-700/50 rounded"></div>
        <div class="w-16 h-6 bg-slate-700/50 rounded-full"></div>
      </div>
    </div>
  </div>
</template>
