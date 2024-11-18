import { Matrix, Scene, Vector2, Vector3 } from '@babylonjs/core'
import { MyPlayer } from '@/babylon/character/myPlayer'
import { Prefab, WorldRenderer } from '@/babylon/world/worldRenderer'
import { MaterialEnum1 } from '@/babylon/materials'
import { PrefabTree1 } from '@/babylon/world/prefabs/tree1'
import { WorldData } from '@/babylon/world/worldData'
import { ViewportManager } from '@/utils/viewport'

export const TreeManager = {
    prefabs: {
        tree1: null as Prefab
    },
    allTrees : [],

    initialize(scene: Scene) {
        this.prefabs.tree1 = PrefabTree1.getPrefab(scene)
        this.addTrees()
    },

    addTrees() {
        // create 50 trees with leafs 1 - 4
        //this.allTrees.push(new tree1.ts(new Vector3(345, 5.5, 580), MaterialEnum1.getMaterialByIndex(Math.floor(Math.random() * 4))))
        //this.allTrees.push(new tree1.ts(new Vector3(350, 5.5, 570), MaterialEnum1.getMaterialByIndex(Math.floor(Math.random() * 4))))

        for (let i = 0; i < 250; i++) {
            const x = 300 + Math.random() * 100
            const z = 500 + Math.random() * 100
            const y = WorldData.getBlockMap()[Math.ceil(x)][Math.ceil(z)].height + 0.5
            this.allTrees.push(new Tree1(new Vector3(x, y, z), Math.floor(Math.random() * 4) * Math.PI / 2, 0.6 + Math.random() * 0.4, MaterialEnum1.getMaterialByIndex(1 + Math.floor(Math.random() * 2))))
        }
    },

    renderTrees() {
        // Prefabs clear the matrices
        for (const key in this.prefabs) {
            this.prefabs[key].clearMatrices()
        }

        const visibleTrees = this.getVisibleTrees()
        for (let i = 0; i < visibleTrees.length; i++) {
            visibleTrees[i].renderLeaves()
            visibleTrees[i].renderTrunk()
        }

        // Prefabs update thin instance buffers
        for (const key in this.prefabs) {
            this.prefabs[key].setThinInstanceBuffers()
        }
    },

    getVisibleTrees() {
        const myPos = MyPlayer.playerData.getPositionRounded()
        const visibleTrees = []

        for (let i = 0; i < this.allTrees.length; i++) {
            const tree = this.allTrees[i]
            if (ViewportManager.isPointInVisibleMatrix(Math.floor(tree.position.x) - myPos.x, Math.floor(tree.position.z) - myPos.z, 2)) {
                visibleTrees.push(tree)
            }
        }
        return visibleTrees
    }
}

class Tree1 {
    position: Vector3
    rotation: number
    scale: number
    leafMaterial: Vector2
    woodMaterial: Vector2
    leavesPrefab: Prefab

    constructor(position: Vector3, rotation: number, scale: number, leafMaterial: Vector2) {
        this.position = position
        this.rotation = rotation
        this.scale = scale
        this.leafMaterial = leafMaterial
        this.woodMaterial = MaterialEnum1.WOOD_1.uv
        this.leavesPrefab = TreeManager.prefabs.tree1
    }

    renderLeaves() {
        const myPos = MyPlayer.playerData.getPositionRounded()
        const matrix = Matrix.Translation( this.position.x - myPos.x, this.position.y + (2 * this.scale), this.position.z - myPos.z);
        const rotationMatrix = Matrix.RotationY(this.rotation);
        const scaleMatrix = Matrix.Scaling(this.scale, this.scale, this.scale);

        this.leavesPrefab.matrices.push(scaleMatrix.multiply(rotationMatrix).multiply(matrix))
        this.leavesPrefab.uvData.push(this.leafMaterial)
    }

    renderTrunk() {
        const myPos = MyPlayer.playerData.getPositionRounded()
        const scaleMatrix = Matrix.Scaling(this.scale / 2, this.scale / 2, this.scale / 2);

        // Blocks for trunk
        for (let i = 0; i <= 2.5 * this.scale; i += this.scale / 2) {
            const positionMatrix = Matrix.Translation( this.position.x - myPos.x, this.position.y + i, this.position.z - myPos.z)

            WorldRenderer.symetricBlock1.matrices.push(scaleMatrix.multiply(positionMatrix))
            WorldRenderer.symetricBlock1.uvData.push(this.woodMaterial)
        }
    }
}
