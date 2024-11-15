import { Matrix, Mesh, Vector2, Vector3 } from '@babylonjs/core'
import { MyPlayer } from '@/babylon/character/myPlayer'
import { Block, WorldRenderer } from '@/babylon/world/worldRenderer'
import { MaterialEnum1 } from '@/babylon/materials'

export const TreeManager = {
    allTrees : [],

    addTree() {
        this.allTrees.push(new Tree1(new Vector3(352, 5.5, 572), MaterialEnum1.TREE_LEAF_1))
        this.allTrees.push(new Tree1(new Vector3(345, 5.5, 578), MaterialEnum1.TREE_LEAF_3))
    },

    createTreeBlockMatrices() {
        const woodMatrix: Matrix[] = []
        const leafMatrix: Matrix[] = []
        const leafUvData: Vector2[] = []

        for (let i = 0; i < this.allTrees.length; i++) {
            const tree = this.allTrees[i]
            tree.addBlocksToMatrices(woodMatrix, leafMatrix, leafUvData)
        }

        return {
            woodMatrix: woodMatrix,
            leafMatrix: leafMatrix,
            leafUvData: leafUvData
        }
    },

    setTreeInstanceBuffers(treeWoodBlock: Mesh, treeLeafBlock: Mesh) {
        const treeMatrices = TreeManager.createTreeBlockMatrices()
        const treeWoodBuffer = WorldRenderer.createPositionBuffer(treeMatrices.woodMatrix)
        const treeLeafBuffer = WorldRenderer.createPositionBuffer(treeMatrices.leafMatrix)
        const treeLeafUvBuffer = WorldRenderer.createUvBuffer(treeMatrices.leafUvData)

        treeWoodBlock.thinInstanceSetBuffer("matrix", treeWoodBuffer, 16)
        treeLeafBlock.thinInstanceSetBuffer("matrix", treeLeafBuffer, 16)
        treeLeafBlock.thinInstanceSetBuffer("uvc", treeLeafUvBuffer, 2)
    }
}

class Tree1 {
    position: Vector3
    leafMaterial: Vector2

    constructor(position: Vector3, leafMaterial: Vector2) {
        this.position = position
        this.leafMaterial = leafMaterial
    }

    addBlocksToMatrices(woodMatrix: Matrix[], leafMatrix: Matrix[], leafUvData: Vector2[]) {
        const myPos = MyPlayer.playerData.getPositionRounded()

        // Blocks for wood of the tree
        const woodBlocks: Block[] = []
        for (let i = 0; i < 3; i+=0.5) {
            woodBlocks.push(new Block(new Vector3(0, i, 0), 0.5))
        }

        woodBlocks.forEach((block) => {
            woodMatrix.push(Matrix.Translation( this.position.x - myPos.x + block.pos.x, this.position.y + block.pos.y, this.position.z - myPos.z + block.pos.z))
        })

        // Blocks for leaves of the tree
        const leafBlocks: Block[] = []
        let y = 2.5
        const size = 0.5
        let layer = [ {x: -0.5, z: -1}, {x: 0, z: -1}, {x: 0.5, z: -1}, {x: -1, z: -0.5}, {x: 1, z: -0.5}, {x: -1, z: 0}, {x: 1, z: 0}, {x: -1, z: 0.5}, {x: 1, z: 0.5}, {x: -0.5, z: 1}, {x: 0, z: 1}, {x: 0.5, z: 1}, {x: 1, z: 1} ]
        layer.forEach((pos) => {
            leafBlocks.push(new Block(new Vector3(pos.x, y, pos.z), size))
        })

        y = 3
        layer = [{ x: -0.5, z: -1 }, { x: 0, z: -1 }, { x: 0.5, z: -1 }, { x: -1, z: -0.5 }, { x: -0.5, z: -0.5 }, { x: 1, z: -0.5 }, { x: -1, z: 0 }, { x: 1, z: 0 },
            { x: -1, z: 0.5 }, { x: 0.5, z: 0.5 }, { x: 1, z: 0.5 }, { x: -0.5, z: 1 }, { x: 0, z: 1 }, { x: 0.5, z: 1 }, { x: 1, z: 1 }];
        layer.forEach((pos) => {
            leafBlocks.push(new Block(new Vector3(pos.x, y, pos.z), size))
        })

        y = 3.5
        leafBlocks.push(...[
            { x: 0, z: -0.5 }, { x: 0.5, z: -0.5 },
            { x: -0.5, z: 0 }, { x: 0.5, z: 0 },
            { x: 0, z: 0.5 }, { x: -0.5, z: 0.5 }
        ].map(coord => new Block(new Vector3(coord.x, y, coord.z), 0.5)));

        y = 4
        leafBlocks.push(...[
            { x: 0.5, z: 0 }, { x: 0, z: -0.5 }, { x: 0, z: 0.5 }, { x: 0, z: 0 }
        ].map(coord => new Block(new Vector3(coord.x, y, coord.z), 0.5)));

        leafBlocks.forEach((block) => {
            const posMatrix = Matrix.Translation(this.position.x - myPos.x + block.pos.x,this.position.y + block.pos.y,this.position.z - myPos.z + block.pos.z)
            leafMatrix.push(Matrix.Scaling(0.5, 0.5, 0.5).multiply(posMatrix));
            leafUvData.push(this.leafMaterial)
        })
    }
}


