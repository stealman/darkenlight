import {PlayerData} from "@/data/playerlData";
import {Mesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";
import { WorldData } from '@/babylon/world/worldData'

export const MyPlayer = {
    playerData: new PlayerData(0, 0, 0, 0),
    scene: null as Scene | null,
    charModel: null as Mesh | null,

    initialize(scene: Scene) {
        this.scene = scene
        this.playerData = new PlayerData(100, 355, 575, 0)
        this.playerData.yPos = this.calculateYPos()
        this.playerData.modelYpos = this.playerData.yPos

        this.charModel = MeshBuilder.CreateBox("plr", {width: 0.6, depth: 0.6, height: 1.5}, scene);
        this.charModel.position = new Vector3(0, 0.75, 0);
    },

    onFrame(timeRate: number) {
        if (this.playerData.targetBlock != null) {
            const targetBlock = this.playerData.targetBlock

            // Check distance from target block (maximal from both axis)
            const dx = Math.abs(targetBlock.x - this.playerData.xPos)
            const dz = Math.abs(targetBlock.z - this.playerData.zPos)

            if (dx < 0.1 && dz < 0.1) {
                this.playerData.targetBlock = null
                this.playerData.moveAngle = null
            }
        }

        if (this.playerData.moveAngle != null) {
            this.playerData.xPos += Math.cos(this.playerData.moveAngle + Math.PI / 4) * this.playerData.moveSpeed * timeRate
            this.playerData.zPos -= Math.sin(this.playerData.moveAngle + Math.PI / 4) * this.playerData.moveSpeed * timeRate
            this.playerData.yPos = this.calculateYPos()

            // approximate modelYpos to the yPos by 0.01
            this.playerData.modelYpos += (this.playerData.yPos - this.playerData.modelYpos) * 15 * timeRate
        }
    },

    calculateYPos() {
        const map = WorldData.getBlockMap()
        const coveredBlocks = this.getCoveredBlocks(this.playerData.xPos, this.playerData.zPos, 0.6)

        // From map get all blocks that are covered by the player and find the highest one
        let highest = 0
        coveredBlocks.forEach(block => {
            if (map[block.x][block.z].height > highest) {
                highest = map[block.x][block.z].height
            }
        })

        return highest
    },

    getCoveredBlocks(xPos: number, zPos: number, characterWidth, blockSize = 1) {
        const threshold = blockSize - (characterWidth / 2);

        const coveredBlocks = [];
        for (let x = Math.floor(xPos) -2; x <= Math.ceil(xPos) + 2; x++) {
            for (let z = Math.floor(zPos) -2; z <= Math.ceil(zPos) + 2; z++) {

                if (Math.abs(x - xPos) < threshold && Math.abs(z - zPos) < threshold) {
                    coveredBlocks.push( {x: x, z: z} )
                }

            }
        }

        return coveredBlocks;
    },

    setMoveAngle(angle: number | null) {
        this.playerData.moveAngle = angle
    },

    setTargetPoint(point: Vector3 | null) {
        if (point == null) {
            this.playerData.targetBlock = null
            this.playerData.moveAngle = null
        } else {
            point.x += this.playerData.xPos
            point.z += this.playerData.zPos

            const angle = Math.atan2(-(point.z - this.playerData.zPos), point.x - this.playerData.xPos)
            this.playerData.moveAngle = angle - Math.PI / 4
            this.playerData.targetBlock = point
        }
    }
}
