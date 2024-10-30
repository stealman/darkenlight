import {WorldData} from "@/babylon/world/worldData";
import { Matrix, Mesh, Scene, ShadowGenerator, TransformNode } from '@babylonjs/core'
import {MyPlayer} from "@/babylon/character/myPlayer";
import {
    createCube,
    createHorizontalPlane,
    getDirtMaterial, getDirtPlaneMaterial,
    getGrassMaterial,
    getGrassPlaneMaterial,
    getWaterMaterial,
} from '@/babylon/block'
import {Settings} from "@/settings/settings";

export const WorldRenderer = {
    basicBlockTypes: 3,
    basicBlockBuffers: [] as Float32Array[],
    basicPlaneBuffers: [] as Float32Array[],
    bufferResizeThreshold: 512,

    grassCube: null as Mesh | null,
    grassPlane: null as Mesh | null,
    dirtCube: null as Mesh | null,
    dirtPlane: null as Mesh | null,

    worldParentNode: null as TransformNode | null,

    initialize(scene: Scene, shadow: ShadowGenerator) {
        this.worldParentNode = new TransformNode("worldNode", scene)

        this.grassCube = createCube(scene, this.worldParentNode)
        this.grassCube.material = getGrassMaterial(scene)
        this.grassPlane = createHorizontalPlane(scene, this.worldParentNode, 1, 0.5)
        this.grassPlane.material = getGrassPlaneMaterial(scene)

        this.dirtCube = createCube(scene, this.worldParentNode)
        this.dirtCube.material = getDirtMaterial(scene)
        this.dirtPlane = createHorizontalPlane(scene, this.worldParentNode,1, 0.5)
        this.dirtPlane.material = getDirtPlaneMaterial(scene)

        this.basicBlockBuffers = Array.from({ length: this.basicBlockTypes }, () => new Float32Array(this.bufferResizeThreshold * 16))
        this.basicPlaneBuffers = Array.from({ length: this.basicBlockTypes }, () => new Float32Array(this.bufferResizeThreshold * 16))

        if (!Settings.touchEnabled) {
            this.grassCube.receiveShadows = true
            this.grassPlane.receiveShadows = true
            this.dirtCube.receiveShadows = true

            shadow.addShadowCaster(this.grassCube)
            shadow.addShadowCaster(this.grassPlane)
            shadow.addShadowCaster(this.dirtCube)
            shadow.addShadowCaster(this.dirtPlane)
        }

        // Water planes
        const plane = createHorizontalPlane(scene, this.worldParentNode,128, 0)
        plane.material = getWaterMaterial(scene)
        plane.position.y = 2.4

        for (let i = 2.65; i <= 6.5; i += 0.25) {
            const instance = plane.createInstance('plane' + i)
            instance.position.y = i
        }
    },

    /**
     * Renders the world around the player
     */
    renderWorld() {
        const myPos = MyPlayer.playerData.getPositionRounded()
        const map = WorldData.getBlockMap()
        const planeBlockMap = WorldData.getPlaneBlockMap()

        // Init array and fill with empty arrays for each block type
        const blockMatrices = Array.from({ length: this.basicBlockBuffers.length }, () => [])
        const planeMatrices = Array.from({ length: this.basicPlaneBuffers.length }, () => [])

        for (let x = myPos.x - 32; x < myPos.x + 32; x++) {
            for (let z = myPos.z - 32; z < myPos.z + 32; z++) {
                const block = map[x][z]
                const matrix = Matrix.Translation(myPos.x - x, block.height, myPos.z - z);

                if (block.type > 0) {
                    if (planeBlockMap[x][z]) {
                        planeMatrices[planeBlockMap[x][z].type].push(matrix)
                    } else {
                        blockMatrices[block.type].push(matrix)
                    }
                }
            }
        }

        // Update buffer size if needed and copy matrices
        for (let i = 0; i < this.basicBlockBuffers.length; i++) {
            if (blockMatrices[i].length > this.basicBlockBuffers[i].length / 16) {
                this.basicBlockBuffers[i] = new Float32Array((blockMatrices[i].length + this.bufferResizeThreshold) * 16)
            } else if (blockMatrices[i].length + this.bufferResizeThreshold < this.basicBlockBuffers[i].length / 16) {
                this.basicBlockBuffers[i] = new Float32Array((blockMatrices[i].length) * 16)
            }

            blockMatrices[i].forEach((matrix, index) => {
                matrix.copyToArray(this.basicBlockBuffers[i], index * 16)
            })
        }

        for (let i = 0; i < this.basicPlaneBuffers.length; i++) {
            if (planeMatrices[i].length > this.basicPlaneBuffers[i].length / 16) {
                this.basicPlaneBuffers[i] = new Float32Array((planeMatrices[i].length + this.bufferResizeThreshold) * 16)
            } else if (planeMatrices[i].length + this.bufferResizeThreshold < this.basicPlaneBuffers[i].length / 16) {
                this.basicPlaneBuffers[i] = new Float32Array((planeMatrices[i].length) * 16)
            }

            planeMatrices[i].forEach((matrix, index) => {
                matrix.copyToArray(this.basicPlaneBuffers[i], index * 16)
            })
        }

        // Apply buffers to the cubes and planes
        this.dirtCube?.thinInstanceSetBuffer("matrix", this.basicBlockBuffers[1], 16)
        this.grassCube?.thinInstanceSetBuffer("matrix", this.basicBlockBuffers[2], 16)
        this.dirtPlane?.thinInstanceSetBuffer("matrix", this.basicPlaneBuffers[1], 16)
        this.grassPlane?.thinInstanceSetBuffer("matrix", this.basicPlaneBuffers[2], 16)
    },

    updateWorldParentNode() {
        const map = WorldData.getBlockMap()
        this.worldParentNode!.position.y = -1.5 -map[MyPlayer.playerData.getPositionRounded().x][MyPlayer.playerData.getPositionRounded().z].height
        this.worldParentNode!.position.x = MyPlayer.playerData.getOffset().x
        this.worldParentNode!.position.z = MyPlayer.playerData.getOffset().z
    }
}
