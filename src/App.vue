<template>
  <div id="app">
    <canvas ref="canvas" class="renderer"></canvas>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { initializeBabylon } from './babylon/renderer'
import {loadBMPData} from "./babylon/utils/bmpLoader";
import { Data } from './babylon/data/globalData';

export default {
  name: 'App',

  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)

    onMounted(async () => {
      if (canvas.value) {
        await loadWorldData()
        initializeBabylon(canvas.value)
      }
    });

    return {
      canvas
    }
  }
}

async function loadWorldData() {
  const mapData = await loadBMPData('./assets/map.bmp') as number[][]
  Data.setWorldMap(mapData)
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
