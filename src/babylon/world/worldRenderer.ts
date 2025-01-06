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
import { TerrainManager } from '@/babylon/world/terrainManager'
import { Data } from '@/data/globalData'

export const WorldRenderer = {
    symetricBlock1: null as SymetricBlock,
    worldParentNode: null as TransformNode,

    initialize(scene: Scene, shadow: ShadowGenerator) {
        this.worldParentNode = new TransformNode("worldNode", scene)

        // Global blocks
        this.symetricBlock1 = new SymetricBlock(Builder.createBlock(scene, this.worldParentNode), Materials.symetricBlockMaterial1)
        this.symetricBlock1.mesh.doNotSyncBoundingInfo = true

        // Initialize managers
        TerrainManager.initialize(scene)
        TreeManager.initialize(scene)

        if (Settings.shadows) {
            shadow.addShadowCaster(TerrainManager.terrainBlock1)
            shadow.addShadowCaster(TerrainManager.terrainPlane)
            shadow.addShadowCaster(this.symetricBlock1.mesh)
            shadow.addShadowCaster(TreeManager.prefabs.tree1.mesh)
        }
    },

    /**
     * Renders the world around the player
     */
    renderWorld() {
        this.symetricBlock1.clearMatrices()

        // Render terrain
        TerrainManager.renderTerrain()

        // Render trees
        TreeManager.renderTrees()

        this.symetricBlock1.setThinInstanceBuffers()
        this.symetricBlock1.mesh.thinInstanceRefreshBoundingInfo(false);
    },

    updateWorldParentNode() {
        this.worldParentNode!.position = new Vector3(-Data.myChar.getOffset().x, -Data.myChar.modelYpos, -Data.myChar.getOffset().z)
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
