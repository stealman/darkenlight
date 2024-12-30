import { MyPlayer } from '@/babylon/character/myPlayer'
import { WorldData } from '@/babylon/world/worldData'
import { Matrix, Mesh } from '@babylonjs/core'
import { BabylonUtils } from '@/babylon/utils'
import { Builder } from '@/babylon/builder'
import { Materials, PlaneEnum1, TerrainEnum1 } from '@/babylon/materials'
import { WorldRenderer } from '@/babylon/world/worldRenderer'
import { Settings } from '@/settings/settings'
import { ViewportManager } from '@/utils/viewport'

export const TerrainManager = {
    terrainBlock1: null as Mesh,
    terrainPlane: null as Mesh,

    initialize (scene) {

        // Terrain and plane blocks
        this.terrainBlock1 = Builder.createBlockWithFaces(scene, WorldRenderer.worldParentNode!)
        this.terrainBlock1.material = Materials.terrainMaterial
        this.terrainBlock1.isPickable = true
        this.terrainBlock1.thinInstanceEnablePicking = true

        this.terrainPlane = Builder.createHorizontalPlane(scene, WorldRenderer.worldParentNode!, 1, 0)
        this.terrainPlane.material = Materials.planeMaterial

        if (Settings.shadows) {
            this.terrainBlock1.receiveShadows = true
            this.terrainPlane.receiveShadows = true
        }

        // Water planes
        const plane = Builder.createHorizontalPlane(scene, WorldRenderer.worldParentNode,256, 0)
        plane.material = Materials.waterMaterial
        plane.position.y = 1
        plane.isPickable = false

        for (let i = 1.25; i <= 4.75; i += 0.25) {
            plane.createInstance('plane' + i).position.y = i
        }
    },

    renderTerrain() {
        const myPos = MyPlayer.playerData.getPositionRounded()
        const map = WorldData.getBlockMap()
        const planeBlockMap = WorldData.getPlaneBlockMap()

        const terrainMatrices1 = []
        const terrainUvData1 = []
        const planeMatrices = []
        const planeUvData = []

        let count = 0
        for (let x = Math.max(0, myPos.x + ViewportManager.minX); x <= Math.min(map.length, myPos.x + ViewportManager.maxX); x++) {
            for (let z = Math.max(0, myPos.z + ViewportManager.minZ); z <= Math.min(map.length, myPos.z + ViewportManager.maxZ); z++) {

                // Check if block is in visible matrix
                if (!ViewportManager.isPointInVisibleMatrix(x - myPos.x, z - myPos.z, 2)) {
                    continue
                }

                const block = map[x][z]
                const matrix = Matrix.Translation( x - myPos.x, block.height, z - myPos.z);

                if (block.type > 0) {
                    if (planeBlockMap[x][z]) {
                        planeMatrices.push(matrix)
                        planeUvData.push(PlaneEnum1.getPlaneByIndex(planeBlockMap[x][z].type))
                    } else {
                        terrainMatrices1.push(matrix)
                        terrainUvData1.push(TerrainEnum1.getTerrainByIndex(block.type))
                    }
                }

                count++
            }
        }

        // console.log('Visible blocks ' + count)

        // Apply buffers for instances
        this.terrainBlock1.thinInstanceSetBuffer("matrix", BabylonUtils.createPositionBuffer(terrainMatrices1), 16)
        this.terrainBlock1.thinInstanceSetBuffer("uvc", BabylonUtils.createUvBuffer(terrainUvData1), 2)
        this.terrainPlane.thinInstanceSetBuffer("matrix", BabylonUtils.createPositionBuffer(planeMatrices), 16)
        this.terrainPlane.thinInstanceSetBuffer("uvc", BabylonUtils.createUvBuffer(planeUvData), 2)
    }
}
