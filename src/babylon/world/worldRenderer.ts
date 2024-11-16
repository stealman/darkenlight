import {WorldData} from "@/babylon/world/worldData";
import {
    Matrix,
    Mesh,
    Scene,
    ShadowGenerator,
    TransformNode, Vector2, Vector3
} from '@babylonjs/core'
import {MyPlayer} from "@/babylon/character/myPlayer";
import {Settings} from "@/settings/settings";
import { Builder } from '@/babylon/builder'
import { Materials } from '@/babylon/materials'
import { TreeManager } from '@/babylon/world/treeManager'
import { BabylonUtils } from '@/babylon/utils'

export const WorldRenderer = {
    terrainBlock1: null as Mesh | null,
    terrainPlane: null as Mesh | null,

    symetricBlock1: null as SymetricBlock,

    worldParentNode: null as TransformNode | null,

    initialize(scene: Scene, shadow: ShadowGenerator) {
        this.worldParentNode = new TransformNode("worldNode", scene)

        this.terrainBlock1 = Builder.createBlockWithFaces(scene, this.worldParentNode)
        this.terrainBlock1.material = Materials.terrainMaterial
        this.terrainBlock1.isPickable = true
        this.terrainBlock1.thinInstanceEnablePicking = true

        this.terrainPlane = Builder.createHorizontalPlane(scene, this.worldParentNode, 1, 0)
        this.terrainPlane.material = Materials.planeMaterial

        // Global blocks
        this.symetricBlock1 = new SymetricBlock(Builder.createBlock(scene, this.worldParentNode), Materials.symetricBlockMaterial1)

        // Initialize managers
        TreeManager.initialize(scene)

        // Water planes
        const plane = Builder.createHorizontalPlane(scene, this.worldParentNode,256, 0)
        plane.material = Materials.waterMaterial
        plane.position.y = 1
        plane.isPickable = false

        for (let i = 1.25; i <= 4.75; i += 0.25) {
            plane.createInstance('plane' + i).position.y = i
        }

        if (Settings.shadows) {
            this.terrainBlock1.receiveShadows = true
            this.terrainPlane.receiveShadows = true

            shadow.addShadowCaster(this.terrainBlock1)
            shadow.addShadowCaster(this.terrainPlane)
            shadow.addShadowCaster(this.symetricBlock1.mesh)
            shadow.addShadowCaster(TreeManager.prefabs.tree1.mesh)
        }
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

        // Apply buffers for instances
        this.terrainBlock1?.thinInstanceSetBuffer("matrix", BabylonUtils.createPositionBuffer(tBlockMatrices1), 16)
        this.terrainBlock1?.thinInstanceSetBuffer("uvc", BabylonUtils.createUvBuffer(tBlockUvData1), 2)
        this.terrainPlane?.thinInstanceSetBuffer("matrix", BabylonUtils.createPositionBuffer(planeMatrices), 16)
        this.terrainPlane?.thinInstanceSetBuffer("uvc", BabylonUtils.createUvBuffer(planeUvData), 2)

        this.symetricBlock1.clearMatrices()

        // Render trees
        TreeManager.renderTrees()

        this.symetricBlock1.setThinInstanceBuffers()
    },

    updateWorldParentNode() {
        this.worldParentNode!.position = new Vector3(-MyPlayer.playerData.getOffset().x, -MyPlayer.playerData.modelYpos, -MyPlayer.playerData.getOffset().z)
    }
}

export class Prefab {
    mesh: Mesh
    matrices: Matrix[] = []
    uvData: Vector2[] = []

    constructor(mesh: Mesh) {
        this.mesh = mesh
        this.mesh.doNotSyncBoundingInfo = true
    }

    clearMatrices() {
        this.matrices = []
        this.uvData = []
    }

    setThinInstanceBuffers() {
        this.mesh.thinInstanceSetBuffer("matrix", BabylonUtils.createPositionBuffer(this.matrices), 16)
        this.mesh.thinInstanceSetBuffer("uvc", BabylonUtils.createUvBuffer(this.uvData), 2)
    }
}

class SymetricBlock {
    mesh: Mesh
    matrices: Matrix[] = []
    uvData: Vector2[] = []

    constructor(mesh, material) {
        this.mesh = mesh
        this.mesh.material = material
    }

    clearMatrices() {
        this.matrices = []
        this.uvData = []
    }

    setThinInstanceBuffers() {
        this.mesh.thinInstanceSetBuffer("matrix", BabylonUtils.createPositionBuffer(this.matrices), 16)
        this.mesh.thinInstanceSetBuffer("uvc", BabylonUtils.createUvBuffer(this.uvData), 2)
    }
}
