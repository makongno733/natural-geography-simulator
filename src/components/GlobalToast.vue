<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <transition-group name="toast-anim" tag="div" class="toast-stack">
      <div
        v-for="item in toast.list.value"
        :key="item.id"
        class="toast-card"
        :class="`toast-${item.type}`"
        role="alert"
      >
        <span class="toast-icon" aria-hidden="true">
          <template v-if="item.type === 'success'">✓</template>
          <template v-else-if="item.type === 'warn'">⚠</template>
          <template v-else-if="item.type === 'error'">✕</template>
          <template v-else>✦</template>
        </span>
        <div class="toast-content">{{ item.message }}</div>
        <button
          type="button"
          class="toast-close"
          aria-label="关闭提示"
          @click="toast.dismiss(item.id)"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toast } from '../utils/toast.js'
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  pointer-events: none;
  max-width: min(420px, calc(100vw - 32px));
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-card {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(15, 35, 62, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #f7f9fa;
  border: 1px solid rgba(197, 160, 89, 0.45);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(7, 19, 34, 0.35), 0 0 12px rgba(197, 160, 89, 0.15);
  font-size: 13.5px;
  line-height: 1.5;
  letter-spacing: 0.01em;
}

.toast-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid currentColor;
}

.toast-info .toast-icon {
  color: #c5a059;
  background: rgba(197, 160, 89, 0.15);
}

.toast-success {
  border-color: rgba(82, 183, 136, 0.6);
}

.toast-success .toast-icon {
  color: #52b788;
  background: rgba(82, 183, 136, 0.15);
}

.toast-warn {
  border-color: rgba(216, 183, 115, 0.7);
}

.toast-warn .toast-icon {
  color: #d8b773;
  background: rgba(216, 183, 115, 0.15);
}

.toast-error {
  border-color: rgba(200, 100, 70, 0.65);
}

.toast-error .toast-icon {
  color: #e27d60;
  background: rgba(200, 100, 70, 0.15);
}

.toast-content {
  flex: 1;
  word-break: break-word;
}

.toast-close {
  background: transparent;
  border: none;
  color: rgba(240, 244, 248, 0.6);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.15s ease;
}

.toast-close:hover {
  color: #ffffff;
}

/* 动效 */
.toast-anim-enter-active {
  transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-anim-leave-active {
  transition: all 0.2s ease-in;
}

.toast-anim-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}

.toast-anim-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

@media (max-width: 640px) {
  .toast-container {
    right: 16px;
    bottom: 16px;
    left: 16px;
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-anim-enter-active,
  .toast-anim-leave-active {
    transition: opacity 0.1s ease !important;
  }
  .toast-anim-enter-from,
  .toast-anim-leave-to {
    transform: none !important;
  }
}
</style>
