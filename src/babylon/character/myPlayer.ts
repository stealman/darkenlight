import {PlayerData} from "@/data/playerlData";
import {
    Scene,
    Vector3,
} from '@babylonjs/core'
import { WorldData } from '@/babylon/world/worldData'
import { CharacterModel } from '@/babylon/character/characterModel'

export const MyPlayer = {
    playerData: new PlayerData(0, 0, 0, 0),
    scene: null as Scene | null,
    charModel: null as CharacterModel | null,

    initialize(scene: Scene) {
        this.charModel = new CharacterModel(scene)
        this.playerData = new PlayerData(100, 355, 575, 0)
        this.playerData.yPos = this.calculateYPos()
        this.playerData.modelYpos = this.playerData.yPos
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

            // Approximate modelYpos to the yPos
            this.playerData.modelYpos += (this.playerData.yPos - this.playerData.modelYpos) * 15 * timeRate

            // Approximate model rotation to the move angle
            let angleDifference = this.playerData.moveAngle - this.charModel!.model.rotation.y
            if (Math.abs(angleDifference) > Math.PI) {
                angleDifference += angleDifference > 0 ? -2 * Math.PI : 2 * Math.PI;
            }

            this.charModel!.model.rotation.y += angleDifference * 15 * timeRate;
            this.charModel?.startRunAnimation()
        } else {
            this.charModel?.stopAnimation()
        }
    },

    calculateYPos() {
        const map = WorldData.getBlockMap()
        const coveredBlocks = this.getCoveredBlocks(this.playerData.xPos, this.playerData.zPos, 0.4)

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
