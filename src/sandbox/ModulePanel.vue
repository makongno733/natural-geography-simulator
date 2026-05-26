<template>
  <aside class="module-panel">
    <div class="panel-section">
      <h3>地貌模块</h3>
      <ul class="module-list">
        <li v-for="m in modules" :key="m.id"
          class="module-item"
          :class="{ active: m.id === activeModuleId, locked: m.locked }"
          @click="m.locked || $emit('select', m.id)">
          <span class="icon">{{ m.icon }}</span>
          <span class="name">{{ m.name }}</span>
          <span v-if="m.locked" class="badge">即将</span>
        </li>
      </ul>
    </div>

    <div class="panel-section">
      <h3>参数控制</h3>
      <div class="params">
        <label class="param-row">
          <span>演化时间</span>
          <input type="range" min="0" max="1" step="0.01"
            :value="params.timeline"
            @input="$emit('update:params',{...params,timeline:+$event.target.value})" />
          <span class="val">{{(params.timeline*100).toFixed(0)}}%</span>
        </label>
        <label class="param-row">
          <span>气候强度</span>
          <input type="range" min="0" max="1" step="0.01"
            :value="params.climate"
            @input="$emit('update:params',{...params,climate:+$event.target.value})" />
          <span class="val">{{(params.climate*100).toFixed(0)}}%</span>
        </label>
        <label class="param-row">
          <span>抬升速率</span>
          <input type="range" min="0" max="1" step="0.01"
            :value="params.uplift"
            @input="$emit('update:params',{...params,uplift:+$event.target.value})" />
          <span class="val">{{(params.uplift*100).toFixed(0)}}%</span>
        </label>
      </div>
    </div>

    <div class="panel-section">
      <h3>河流类型</h3>
      <div class="river-grid">
        <button v-for="r in riverTypes" :key="r.id"
          class="river-btn" :class="{active: activeType===r.id}"
          @click="$emit('selectType', r.id)">{{ r.name }}</button>
      </div>
    </div>

    <div class="panel-section">
      <h3>工具</h3>
      <div class="tool-grid">
        <button class="tool-btn" @click="$emit('tool','resetView')">重置视角</button>
        <button class="tool-btn" :class="{active:params.viewMode==='section'}"
          @click="$emit('tool','toggleSection')">剖面</button>
        <button class="tool-btn" :class="{active:params.viewMode==='terrain' && params.autoRotate}"
          @click="$emit('tool','autoRotate')">旋转</button>
      </div>
    </div>

    <div class="panel-section">
      <h3>天气</h3>
      <div class="weather-grid">
        <button v-for="w in weatherModes" :key="w.id"
          class="weather-btn" :class="{active:params.weatherMode===w.id}"
          @click="$emit('update:params',{...params,weatherMode:w.id})">{{ w.label }}</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({ modules: Array, activeModuleId: String, params: Object, riverTypes: Array, activeType: String })
defineEmits(['select','update:params','tool','selectType'])
const weatherModes = [
  { id: 'clear', label: '晴' }, { id: 'rain', label: '雨' },
  { id: 'snow', label: '雪' }, { id: 'cloud', label: '阴' }, { id: 'fog', label: '雾' }
]
</script>

<style scoped>
.module-panel {
  background: rgba(247,252,255,0.88);
  border: 1px solid #a9c6e8;
  border-radius: 9px;
  padding: 8px;
  font-size: .75rem;
  overflow-y: auto;
  max-height: calc(100vh - 60px);
}
.panel-section {
  margin-bottom: 10px;
}
.panel-section h3 {
  margin: 0 0 6px;
  font-size: .75rem;
  color: #1d4f81;
  font-weight: 600;
}
.module-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
}
.module-item {
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #365776;
  border: 1px solid transparent;
}
.module-item:hover {
  background: rgba(202,231,255,.4);
}
.module-item.active {
  background: #cae7ff;
  border-color: #7bb4e7;
  color: #113f6a;
  font-weight: 600;
}
.module-item.locked {
  opacity: .5;
  cursor: not-allowed;
}
.module-item .icon {
  font-size: 1rem;
}
.module-item .badge {
  font-size: .6rem;
  background: #d0e3f8;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: auto;
  color: #5a7f9f;
}
.params {
  display: grid;
  gap: 5px;
}
.param-row {
  display: grid;
  grid-template-columns: 60px 1fr 30px;
  gap: 4px;
  align-items: center;
  font-size: .68rem;
  color: #365776;
}
.param-row input {
  height: 4px;
  accent-color: #3688cf;
}
.param-row .val {
  font-size: .64rem;
  color: #5a7f9f;
  text-align: right;
  font-family: "SF Mono", Menlo, monospace;
}
.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
.tool-btn {
  border: 1px solid #a9c6e8;
  border-radius: 8px;
  padding: 5px;
  background: #f9fcff;
  color: #365776;
  font-size: .65rem;
  cursor: pointer;
  text-align: center;
}
.tool-btn:hover {
  background: #e8f2ff;
}
.tool-btn.active {
  background: #cae7ff;
  border-color: #7bb4e7;
  color: #113f6a;
  font-weight: 600;
}
.weather-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
}
.weather-btn {
  border: 1px solid #a9c6e8;
  border-radius: 6px;
  padding: 4px 2px;
  background: #f9fcff;
  color: #365776;
  font-size: .6rem;
  cursor: pointer;
  text-align: center;
}
.weather-btn:hover {
  background: #e8f2ff;
}
.weather-btn.active {
  background: #cae7ff;
  border-color: #7bb4e7;
  color: #113f6a;
  font-weight: 600;
}
.river-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.river-btn {
  border: 1px solid #a9c6e8;
  border-radius: 6px;
  padding: 4px 2px;
  background: #f9fcff;
  color: #365776;
  font-size: .6rem;
  cursor: pointer;
  text-align: center;
}
.river-btn:hover {
  background: #e8f2ff;
}
.river-btn.active {
  background: #cae7ff;
  border-color: #7bb4e7;
  color: #113f6a;
  font-weight: 600;
}
</style>
