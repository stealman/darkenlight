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

    grassCube: null as Mesh | null,
    grassPlane: null as Mesh | null,
    dirtCube: null as Mesh | null,
    dirtPlane: null as Mesh | null,

    worldParentNode: null as TransformNode | null,

    initialize(scene: Scene, shadow: ShadowGenerator) {
        this.worldParentNode = new TransformNode("worldNode", scene)

        this.grassCube = createCube(scene, this.worldParentNode)
        this.grassCube.material = getGrassMaterial(scene)
        this.grassCube.isPickable = true
        this.grassCube.thinInstanceEnablePicking = true

        this.grassPlane = createHorizontalPlane(scene, this.worldParentNode, 1, 0)
        this.grassPlane.material = getGrassPlaneMaterial(scene)

        this.dirtCube = createCube(scene, this.worldParentNode)
        this.dirtCube.material = getDirtMaterial(scene)
        this.dirtPlane = createHorizontalPlane(scene, this.worldParentNode,1, 0)
        this.dirtPlane.material = getDirtPlaneMaterial(scene)

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
        const plane = createHorizontalPlane(scene, this.worldParentNode,256, 0)
        plane.material = getWaterMaterial(scene)
        plane.position.y = 1
        plane.isPickable = false

        for (let i = 1.25; i <= 4.75; i += 0.25) {
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
        const blockMatrices = Array.from({ length: 3 }, () => [])
        const planeMatrices = Array.from({ length: 3 }, () => [])

        for (let x = Math.max(0, myPos.x - 20); x < Math.min(map.length, myPos.x + 56); x++) {
            for (let z = Math.max(0, myPos.z - 20); z < Math.min(map.length, myPos.z + 60); z++) {
                const block = map[x][z]
                const matrix = Matrix.Translation( x - myPos.x, block.height, z - myPos.z);

                if (block.type > 0) {
                    if (planeBlockMap[x][z]) {
                        planeMatrices[planeBlockMap[x][z].type].push(matrix)
                    } else {
                        blockMatrices[block.type].push(matrix)
                    }
                }
            }
        }
        const bufferBlock1 = this.createBuffer(blockMatrices[1])
        const bufferBlock2 = this.createBuffer(blockMatrices[2])
        const bufferPlane1 = this.createBuffer(planeMatrices[1])
        const bufferPlane2 = this.createBuffer(planeMatrices[2])

        // Apply buffers to the cubes and planes
        this.dirtCube?.thinInstanceSetBuffer("matrix", bufferBlock1, 16)
        this.grassCube?.thinInstanceSetBuffer("matrix", bufferBlock2, 16)
        this.dirtPlane?.thinInstanceSetBuffer("matrix", bufferPlane1, 16)
        this.grassPlane?.thinInstanceSetBuffer("matrix", bufferPlane2, 16)
    },

    createBuffer(matrices) {
        const buffer = new Float32Array(matrices.length * 16)
        matrices.forEach((matrix, index) => {
            matrix.copyToArray(buffer, index * 16)
        })

        return buffer
    },

    updateWorldParentNode() {
        this.worldParentNode!.position.y = -MyPlayer.playerData.modelYpos
        this.worldParentNode!.position.x = -MyPlayer.playerData.getOffset().x
        this.worldParentNode!.position.z = -MyPlayer.playerData.getOffset().z
    }
}
