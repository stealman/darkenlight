import {WorldData} from "@/babylon/world/worldData";
import {
    Matrix,
    Mesh,
    Scene,
    ShadowGenerator,
    TransformNode, Vector2, Vector3,
} from '@babylonjs/core'
import {MyPlayer} from "@/babylon/character/myPlayer";
import {Settings} from "@/settings/settings";
import { Builder } from '@/babylon/builder'
import { Materials } from '@/babylon/materials'
import { TreeManager } from '@/babylon/world/treeManager'

export const WorldRenderer = {
    terrainBlock1: null as Mesh | null,
    terrainPlane: null as Mesh | null,

    treeWoodBlock: null as Mesh | null,
    symetricBlock1: null as Mesh | null,

    worldParentNode: null as TransformNode | null,

    initialize(scene: Scene, shadow: ShadowGenerator) {
        this.worldParentNode = new TransformNode("worldNode", scene)

        this.terrainBlock1 = Builder.createBlockWithFaces(scene, this.worldParentNode)
        this.terrainBlock1.material = Materials.getTerrainMaterial1(scene)
        this.terrainBlock1.isPickable = true
        this.terrainBlock1.thinInstanceEnablePicking = true

        this.terrainPlane = Builder.createHorizontalPlane(scene, this.worldParentNode, 1, 0)
        this.terrainPlane.material = Materials.getPlaneMaterial(scene)

        this.treeWoodBlock = Builder.createBlockWithFaces(scene, this.worldParentNode, 0.5)
        this.treeWoodBlock.material = Materials.getTreeWoodMaterial(scene)

        this.symetricBlock1 = Builder.createBlock(scene, this.worldParentNode)
        this.symetricBlock1.material = Materials.getSymBlockMaterial1(scene)

        if (!Settings.touchEnabled) {
            this.terrainBlock1.receiveShadows = true
            this.terrainPlane.receiveShadows = true

            shadow.addShadowCaster(this.terrainBlock1)
            shadow.addShadowCaster(this.terrainPlane)
            shadow.addShadowCaster(this.treeWoodBlock)
            shadow.addShadowCaster(this.symetricBlock1)
        }

        // Water planes
        const plane = Builder.createHorizontalPlane(scene, this.worldParentNode,256, 0)
        plane.material = Materials.getWaterMaterial(scene)
        plane.position.y = 1
        plane.isPickable = false

        for (let i = 1.25; i <= 4.75; i += 0.25) {
            const instance = plane.createInstance('plane' + i)
            instance.position.y = i
        }

        TreeManager.addTree()
    },

    /**
     * Renders the world around the player
     */
    renderWorld() {
        const myPos = MyPlayer.playerData.getPositionRounded()
        const map = WorldData.getBlockMap()
        const planeBlockMap = WorldData.getPlaneBlockMap()

        const tBlockMatrices1 = []
        const tBlockUvData1 = []
        const planeMatrices = []
        const planeUvData = []

        for (let x = Math.max(0, myPos.x - 20); x < Math.min(map.length, myPos.x + 56); x++) {
            for (let z = Math.max(0, myPos.z - 20); z < Math.min(map.length, myPos.z + 60); z++) {
                const block = map[x][z]
                const matrix = Matrix.Translation( x - myPos.x, block.height, z - myPos.z);

                if (block.type > 0) {
                    if (planeBlockMap[x][z]) {
                        planeMatrices.push(matrix)

                        if (planeBlockMap[x][z].type === 1) {
                            planeUvData.push(new Vector2(2.5, 6.5))
                        }
                        if (planeBlockMap[x][z].type === 2) {
                            planeUvData.push(new Vector2(0.5, 6.5))
                        }
                    } else {
                        tBlockMatrices1.push(matrix)
                        if (block.type === 1) {
                            tBlockUvData1.push(new Vector2(2.5, 2.5))
                        }
                        if (block.type === 2) {
                            tBlockUvData1.push(new Vector2(0.5, 2.5))
                        }
                    }
                }
            }
        }

        const terrainBlockBuffer = this.createPositionBuffer(tBlockMatrices1)
        const terrainBlockUvBuffer = this.createUvBuffer(tBlockUvData1)
        const terrainPlaneBuffer = this.createPositionBuffer(planeMatrices)
        const terrainPlaneUvBuffer = this.createUvBuffer(planeUvData)

        // Apply buffers for instances
        this.terrainBlock1?.thinInstanceSetBuffer("matrix", terrainBlockBuffer, 16)
        this.terrainBlock1?.thinInstanceSetBuffer("uvc", terrainBlockUvBuffer, 2)
        this.terrainPlane?.thinInstanceSetBuffer("matrix", terrainPlaneBuffer, 16)
        this.terrainPlane?.thinInstanceSetBuffer("uvc", terrainPlaneUvBuffer, 2)

        // Render trees
        TreeManager.setTreeInstanceBuffers(this.treeWoodBlock!, this.symetricBlock1!)
    },

    createPositionBuffer(matrices) {
        const buffer = new Float32Array(matrices.length * 16)
        matrices.forEach((matrix, index) => {
            matrix.copyToArray(buffer, index * 16)
        })

        return buffer
    },

    createUvBuffer(vectors) {
        const buffer = new Float32Array(vectors.length * 2)
        vectors.forEach((vec, index) => {
            buffer[index * 2] = vec.x
            buffer[index * 2 + 1] = vec.y
        })

        return buffer
    },

    updateWorldParentNode() {
        this.worldParentNode!.position.y = -MyPlayer.playerData.modelYpos
        this.worldParentNode!.position.x = -MyPlayer.playerData.getOffset().x
        this.worldParentNode!.position.z = -MyPlayer.playerData.getOffset().z
    }
}

export class Block {
    pos: Vector3 = Vector3.Zero()
    size: number

    constructor(pos: Vector3, size: number) {
        this.pos = pos
        this.size = size
    }
}
