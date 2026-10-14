<template>
  <svg class="brand-mark" :class="{ 'is-playing': playing, 'is-compact': compact }" :style="{ '--brand-duration': `${ANIMATION_MS}ms` }" viewBox="0 0 160 160" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient :id="`${id}-sea`" cx=".32" cy=".24" r=".85">
        <stop :stop-color="dark ? '#2A647B' : '#205570'" />
        <stop offset=".58" stop-color="#0F3B5B" /><stop offset="1" stop-color="#082B42" />
      </radialGradient>
      <linearGradient :id="`${id}-relief`" x1="42" y1="71" x2="110" y2="137" gradientUnits="userSpaceOnUse">
        <stop stop-color="#62A58A" /><stop offset=".48" stop-color="#2E7D5B" /><stop offset="1" stop-color="#174D43" />
      </linearGradient>
      <linearGradient :id="`${id}-orbit`" x1="15" y1="117" x2="145" y2="43" gradientUnits="userSpaceOnUse">
        <stop stop-color="#39745E" /><stop offset=".48" stop-color="#A4B18A" /><stop offset="1" stop-color="#E6C68A" />
      </linearGradient>
      <clipPath :id="`${id}-sphere`"><circle cx="80" cy="80" r="55" /></clipPath>
      <!-- Rear node travels behind the opaque globe; front node is only visible on its near half. -->
    </defs>
    <ellipse cx="80" cy="80" rx="74" ry="27" transform="rotate(-27 80 80)" :stroke="mono ? ink : '#557D6B'" :stroke-width="compact ? 2.5 : 1.7" opacity=".7" />
    <g v-if="!mono" class="orbit-traveler traveler-rear">
      <circle cx="0" cy="0" r="2.2" fill="#E6C68A" />
    </g>
    <circle cx="80" cy="80" r="55" :fill="mono ? '#FFFFFF' : `url(#${id}-sea)`" />
    <g :clip-path="`url(#${id}-sphere)`">
      <g class="graticule" :stroke="mono ? ink : '#A7C9CF'" :stroke-width="compact ? 1.65 : 1.15" :opacity="mono ? .35 : .46" stroke-linecap="round">
        <path pathLength="1" d="M80 25C51 46 51 114 80 135M80 25C109 46 109 114 80 135" />
        <path pathLength="1" d="M28 62C55 77 105 77 132 62M25 83C55 99 105 99 135 83" />
        <path v-if="!compact" pathLength="1" d="M39 44C60 55 100 55 121 44M34 109C59 121 101 121 126 109" opacity=".7" />
      </g>
      <g class="terrain">
        <!-- An asymmetric ridge, foothill and valley share one continuous relief structure. -->
        <path d="M22 103C36 98 42 91 50 86C58 81 61 70 68 69C75 68 78 82 86 81C94 80 101 61 108 61C114 62 120 77 126 80L141 88V142H22Z" :fill="mono ? '#FFFFFF' : `url(#${id}-relief)`" :stroke="mono ? ink : 'none'" stroke-width="1.6" />
        <path class="ridge-line" pathLength="1" d="M25 103C38 98 42 91 50 86C58 81 61 70 68 69C75 68 78 82 86 81C94 80 101 61 108 61C114 62 120 77 126 80L137 86" :stroke="mono ? ink : '#A3C6A2'" :stroke-width="compact ? 2.2 : 1.6" stroke-linecap="round" />
        <path class="contour contour-one" pathLength="1" d="M29 115C43 109 52 107 60 98C65 92 69 84 74 85C80 86 82 96 90 94C99 92 103 78 110 78C117 78 120 90 134 93" :stroke="mono ? ink : '#B5CCA6'" :stroke-width="compact ? 2.1 : 1.35" stroke-linecap="round" opacity=".88" />
        <path v-if="!compact" class="contour contour-two" pathLength="1" d="M35 124C49 117 60 118 68 107C73 101 77 99 83 104C90 110 98 107 104 98C112 87 117 99 131 102" :stroke="mono ? ink : '#84B399'" stroke-width="1.2" stroke-linecap="round" />
        <path v-if="!compact" class="contour contour-three" pathLength="1" d="M49 132C61 124 69 127 78 117C85 111 90 123 99 117C109 109 119 111 127 112" :stroke="mono ? ink : '#A6C3A4'" stroke-width="1.1" stroke-linecap="round" opacity=".7" />
        <path v-if="!compact" d="M101 70C104 65 106 62 108 61C111 62 114 67 116 71" :stroke="mono ? ink : '#C6A572'" stroke-width="1.6" stroke-linecap="round" />
      </g>
    </g>
    <circle cx="80" cy="80" r="55" :stroke="mono ? ink : (dark ? '#8EB5B5' : '#527E8A')" :stroke-width="compact ? 2 : 1.25" />
    <g class="compass">
      <path d="M80 34L85 79L80 75L75 79Z" :fill="mono ? ink : '#E6C68A'" />
      <path d="M80 34V75L85 79Z" :fill="mono ? ink : '#BA965D'" />
      <path d="M80 119L83 84L80 87L77 84Z" :fill="mono ? ink : '#C6AA77'" opacity=".85" />
      <circle cx="80" cy="81.5" r="3.8" :fill="mono ? '#FFFFFF' : '#123F50'" :stroke="mono ? ink : '#E6C68A'" stroke-width="1.35" />
      <circle cx="80" cy="81.5" r="1.15" :fill="mono ? ink : '#F1DEB6'" />
      <path d="M80 13L81.6 18.4L87 20L81.6 21.6L80 27L78.4 21.6L73 20L78.4 18.4Z" :fill="mono ? ink : '#E6C68A'" />
    </g>
    <!-- Matching ellipse halves preserve exact foreground/background occlusion. -->
    <path class="orbit-front" pathLength="1" d="M145.93 46.4A74 27 -27 0 1 14.07 113.6" :stroke="mono ? ink : `url(#${id}-orbit)`" :stroke-width="compact ? 3 : 2.15" stroke-linecap="round" />
    <g v-if="!mono" class="orbit-traveler traveler-front"><circle cx="0" cy="0" r="2.2" fill="#E6C68A" /></g>
  </svg>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

defineProps({ compact: { type: Boolean, default: true }, dark: { type: Boolean, default: false }, mono: { type: Boolean, default: false } })
const id = `geo-${useId().replace(/:/g, '-')}`
const ink = '#0F3B5B'
const ANIMATION_MS = 1850
const playing = ref(false)
let timer
let motionPreference
function stop() {
  if (timer) window.clearTimeout(timer)
  timer = undefined
  playing.value = false
}
function play() {
  if (playing.value || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  playing.value = true
  timer = window.setTimeout(stop, ANIMATION_MS)
}
function onMotionChange(event) { if (event.matches) stop() }
onMounted(() => {
  motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  motionPreference?.addEventListener?.('change', onMotionChange)
})
onBeforeUnmount(() => {
  stop()
  motionPreference?.removeEventListener?.('change', onMotionChange)
})
defineExpose({ play, stop })
</script>

<style scoped>
.brand-mark { width: 56px; height: 56px; overflow: visible; flex: none; --brand-ease: cubic-bezier(.22,.65,.18,1); }
.graticule, .compass { transform-origin: 80px 80px; }
.orbit-traveler { offset-path: path("M145.93 46.4 A74 27 -27 0 1 14.07 113.6 A74 27 -27 0 1 145.93 46.4"); offset-distance: 0%; offset-rotate: 0deg; }
.traveler-rear { visibility: hidden; }
.compass { transition: filter .35s ease; }
.orbit-front { transition: stroke-width .35s ease; }
@media (hover: hover) and (pointer: fine) {
  .brand-mark:hover .compass { filter: brightness(1.12); }
  .brand-mark:hover .orbit-front { stroke-width: 3.3px; }
}
.is-playing .graticule { animation: grid-wake var(--brand-duration) var(--brand-ease) both; }
.is-playing .ridge-line { animation: ridge-wake var(--brand-duration) ease both; }
.is-playing .contour { stroke-dasharray: 1; animation: contour-trace var(--brand-duration) ease both; }
.is-playing .contour-two { animation-name: contour-trace-two; }
.is-playing .contour-three { animation-name: contour-trace-three; }
.is-playing .compass { animation: compass-find var(--brand-duration) var(--brand-ease) both; }
.is-playing .orbit-traveler { animation: node-travel var(--brand-duration) ease-in-out both; }
.is-playing .traveler-front { animation-name: node-travel, near-visibility; }
.is-playing .traveler-rear { animation-name: node-travel, far-visibility; }
@keyframes grid-wake { 0%,100% { transform: translateX(0); opacity: .46; } 16% { transform: translateX(2px); opacity: .72; } 38% { transform: translateX(-1px); opacity: .55; } }
@keyframes ridge-wake { 0%,100% { opacity: 1; } 28% { opacity: .5; } 50% { opacity: 1; } }
@keyframes contour-trace { 0%,20%,65%,100% { stroke-dashoffset: 0; opacity: .88; } 34% { stroke-dashoffset: 1; opacity: .25; } }
@keyframes contour-trace-two { 0%,24%,69%,100% { stroke-dashoffset: 0; } 38% { stroke-dashoffset: 1; } }
@keyframes contour-trace-three { 0%,28%,73%,100% { stroke-dashoffset: 0; } 42% { stroke-dashoffset: 1; } }
@keyframes compass-find { 0%,42%,100% { transform: rotate(0); } 57% { transform: rotate(8deg); } 72% { transform: rotate(-1.5deg); } 86% { transform: rotate(0); } }
@keyframes node-travel { 0%,52% { offset-distance: 0%; } 100% { offset-distance: 100%; } }
@keyframes near-visibility { 0%,76% { visibility: visible; } 76.01%,99.99% { visibility: hidden; } 100% { visibility: visible; } }
@keyframes far-visibility { 0%,76% { visibility: hidden; } 76.01%,99.99% { visibility: visible; } 100% { visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .brand-mark *, .brand-mark { animation: none !important; transition: none !important; } }
</style>
