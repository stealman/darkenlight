<template>
  <div id="app">
    <canvas ref="canvas" class="renderer"></canvas>

    <span id="fpsLabel" style="z-index: 100; font-size: 20px; color: #aaa; position: absolute; left: 10px; top: 30px;">FPS</span>
    <button id="fullScreenBtn" style="cursor: pointer; text-decoration: underline; font-size: 18px; color: #aaa; position: absolute; left: 10px; top: 160px;" @click="this.requestFullscreen()">Fullscreen</button>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { Renderer } from './babylon/renderer'
import {loadBMPData} from "./utils/bmpLoader";
import {WorldData} from "@/babylon/world/worldData";
import { Settings } from '@/settings/settings'

export default {
  name: 'App',

  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)

    onMounted(async () => {
      if (canvas.value) {
          Settings.touchEnabled = ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 );

          await loadWorldData()
          Renderer.initialize(canvas.value)
      }
    });

    return {
      canvas
    }
  },

  methods: {
    requestFullscreen() {
      Renderer.requestFullscreen()
      document.getElementById("fullScreenBtn").style.display = "none"
    }
  }
}

async function loadWorldData() {
  const mapData = await loadBMPData('./assets/map4.png') as number[][]
  WorldData.setWorldMap(mapData)
}
</script>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
}

.renderer {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
