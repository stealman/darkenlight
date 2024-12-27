<template>
  <div id="app">
      <canvas ref="canvas" class="renderer">

      </canvas>
      <canvas ref="miniMapCanvas" id='miniMapCanvas' ></canvas>

      <span id="fpsLabel" style="z-index: 100; font-size: 20px; color: #aaa; position: absolute; left: 10px; top: 10px;">FPS: </span>
      <span id="posLabel" style="z-index: 100; font-size: 20px; color: #aaa; position: absolute; left: 10px; top: 30px;">POS: </span>
      <button id="fullScreenBtn" style="cursor: pointer; text-decoration: underline; font-size: 18px; color: #aaa; position: absolute; left: 10px; top: 160px;" @click="this.requestFullscreen()">Fullscreen</button>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { Renderer } from './babylon/renderer'
import {loadBMPData} from "./utils/bmpLoader";
import {WorldData} from "@/babylon/world/worldData";
import { Settings } from '@/settings/settings'
import { ViewportManager } from '@/utils/viewport'

export default {
  name: 'App',

  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)
    const miniMapCanvas = ref<HTMLCanvasElement | null>(null)

    onMounted(async () => {
        if (canvas.value) {
            Settings.touchEnabled = ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 )
            //Settings.shadows = !Settings.touchEnabled
            Settings.debug = !Settings.touchEnabled
            // Settings.closeView = true
            //Settings.shadows = false

            console.log(Settings.shadows)

            await loadWorldData()
            Renderer.initialize(canvas.value)
            ViewportManager.onResize()
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

#miniMapCanvas {
    width: 100px;
    height: 100px;
    position: absolute;
    top: 0px;
    right: 0px;
    background-color: green;
    opacity: 0.65;
    border-left: 2px ridge rosybrown;
    border-bottom: 2px ridge rosybrown;
}
</style>
