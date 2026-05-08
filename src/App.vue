<template>
  <div class="app">
    <header class="top">
      <h1>大气结构 3D 教学系统（Vue + Three.js）</h1>
      <p>全球/局部可切换，鼠标可旋转缩放，层结固定在地球外并按化学组分展示。</p>
    </header>

    <section class="workspace">
      <article class="viewer-card">
        <div class="toolbar">
          <button class="btn" :class="{ active: scopeMode === 'global' }" @click="setScope('global')">全球</button>
          <button class="btn" :class="{ active: scopeMode === 'local' }" @click="setScope('local')">局部</button>
          <button class="btn" @click="sceneApi?.resetView()">重置视角</button>
          <button class="btn" :class="{ active: animated }" @click="toggleAnimation">{{ animated ? "动态开" : "动态关" }}</button>
        </div>

        <div class="slider-row">
          <label>高度浏览（km）</label>
          <input v-model.number="altitudeKm" type="range" min="0" max="1000" step="1" />
          <span>{{ altitudeKm }} km</span>
        </div>

        <div ref="sceneHost" class="scene-host"></div>

        <div class="composition">
          <div class="composition-title">大气化学组分（示意）</div>
          <div v-for="(item, i) in compositionRows" :key="item.name" class="row" :class="{ current: i === activeLayerIndex }">
            <span class="swatch" :style="{ background: item.color }"></span>
            <div><strong>{{ item.name }}</strong><br />{{ item.comp }}</div>
          </div>
        </div>
      </article>

      <aside class="side">
        <h2>层结与过程</h2>
        <div class="chips">
          <button
            v-for="(layer, i) in layers"
            :key="layer.id"
            class="chip"
            :class="{ active: i === activeLayerIndex }"
            @click="activeLayerIndex = i"
          >
            {{ layer.name }}
          </button>
        </div>
        <div class="note">
          <strong>{{ activeLayer.name }}</strong>｜{{ activeLayer.height }}<br />
          {{ activeLayer.phenomenon }}
        </div>
        <div class="note">{{ activeLayer.detail }}</div>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createAtmosphereScene } from "./lib/atmosphereScene.js";

const layers = [
  { id: "boundary", name: "行星边界层", height: "0-1.5 km", phenomenon: "湍流交换与污染输送最强。", detail: "H2O、CO2、CO、NOx、SO2、VOCs 活跃。", color: "#2f79be" },
  { id: "troposphere", name: "对流层", height: "1.5-12 km", phenomenon: "云、降水、对流系统发生。", detail: "H2O、CO2、CH4、CO、NOx、O3 与 OH 氧化链主导。", color: "#3688cf" },
  { id: "tropopause", name: "对流层顶", height: "8-18 km", phenomenon: "平流/对流交换关键层。", detail: "O3 上升、H2O 快速下降，跨层输送显著。", color: "#4697d8" },
  { id: "stratosphere", name: "平流层", height: "18-50 km", phenomenon: "臭氧光化学与逆温结构。", detail: "O3、NOx、ClOx、BrOx、HNO3 过程关键。", color: "#53a8df" },
  { id: "stratopause", name: "平流层顶", height: "约50 km", phenomenon: "辐射化学转折层。", detail: "O3、NOx、HOx 耦合显著。", color: "#67b7e6" },
  { id: "mesosphere", name: "中间层", height: "52-85 km", phenomenon: "重力波与流星消融活跃。", detail: "O、O2、HOx、NOx 光解过程增强。", color: "#78c3eb" },
  { id: "mesopause", name: "中间层顶", height: "约85 km", phenomenon: "低温极值层。", detail: "O、NO、OH* 夜光化学更敏感。", color: "#86cdf0" },
  { id: "thermosphere", name: "热层", height: "90-600 km", phenomenon: "电离化学与空间天气。", detail: "O、N2、O2、NO+、O+、e- 受太阳活动驱动。", color: "#97d8f4" },
  { id: "exosphere", name: "散逸层", height: "600+ km", phenomenon: "近真空与粒子逃逸。", detail: "H、He 比重增大，碰撞极少。", color: "#a7e3f8" }
];

const compositionRows = computed(() => layers.map((x) => ({ name: x.name, comp: x.detail, color: x.color })));

const sceneHost = ref(null);
const sceneApi = ref(null);
const altitudeKm = ref(12);
const activeLayerIndex = ref(1);
const scopeMode = ref("global");
const animated = ref(true);

const activeLayer = computed(() => layers[activeLayerIndex.value]);

function layerByAltitude(km) {
  if (km < 2) return 0;
  if (km < 12) return 1;
  if (km < 18) return 2;
  if (km < 50) return 3;
  if (km < 52) return 4;
  if (km < 85) return 5;
  if (km < 90) return 6;
  if (km < 600) return 7;
  return 8;
}

function setScope(mode) {
  scopeMode.value = mode;
  sceneApi.value?.setScope(mode);
}

function toggleAnimation() {
  animated.value = !animated.value;
  sceneApi.value?.setAnimated(animated.value);
}

watch(altitudeKm, (v) => {
  activeLayerIndex.value = layerByAltitude(v);
});

watch(activeLayerIndex, (idx) => {
  sceneApi.value?.setActiveLayer(idx);
});

onMounted(() => {
  if (!sceneHost.value) return;
  sceneApi.value = createAtmosphereScene(sceneHost.value, {
    activeLayer: activeLayerIndex.value,
    scope: scopeMode.value,
    animated: animated.value
  });
});

onBeforeUnmount(() => {
  sceneApi.value?.dispose();
});
</script>
