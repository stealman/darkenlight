import { MonsterModel } from '@/babylon/monsters/monsterModel'
import { MonsterType } from '@/babylon/monsters/monsterCodebook'
import { WorldData } from '@/babylon/world/worldData'
import { MyPlayer } from '@/babylon/character/myPlayer'
import { Utils } from '@/utils/utils'
import { Vector3 } from '@babylonjs/core'

export class Monster {
    id: number
    mobType: MonsterType
    model: MonsterModel

    targetPoint: Vector3 | null = null

    hp: number
    runSpeed: number = 1.5
    yMoveSpeed: number = 15
    rotationSpeed: number = 15
    xPos: number
    zPos: number
    yPos: number
    modelYpos: number = 0
    modelRotation: number = 0
    moveAngle: number | null = null

    modelYAngleOffset: number = Math.PI * 1 / 4

    constructor(id: number, mobType: MonsterType, model: MonsterModel, xPos: number, zPos: number) {
        this.id = id
        this.mobType = mobType
        this.model = model
        this.hp = 100
        this.xPos = xPos
        this.zPos = zPos
        this.yPos = 0
        this.modelYpos = 0
    }

    onFrame(timeRate: number, actualTime: number) {
        this.resolveMovement(timeRate)

        // Set model position base ond xPos and zPos and myPlayer.playerData x and z pos
        this.model.model.position.x = this.xPos - MyPlayer.playerData.xPos
        this.model.model.position.z = this.zPos - MyPlayer.playerData.zPos
        this.yPos = this.calculateYPos()
        this.resolveModelYpos(timeRate)
        this.resolveModelRotation(timeRate)
    }

    resolveMovement(timeRate: number) {
        const stepSize = this.runSpeed * timeRate
        if (this.targetPoint != null) {

            const dx = Math.abs(this.targetPoint.x - this.xPos)
            const dz = Math.abs(this.targetPoint.z - this.zPos)

            if (dx <= stepSize && dz <= stepSize) {
                this.xPos = this.targetPoint.x
                this.zPos = this.targetPoint.z
                this.targetPoint = null
                this.moveAngle = null
            }
        }

        if (this.moveAngle != null) {
            this.xPos += (Math.cos(this.moveAngle + Math.PI / 4) * stepSize)
            this.zPos -= (Math.sin(this.moveAngle + Math.PI / 4) * stepSize)
        }
    }

    setTargetPoint(point: Vector3) {
        const angle = Math.atan2(-(point.z - this.zPos), point.x - this.xPos)
        this.moveAngle = angle - Math.PI / 4
        this.targetPoint = point
    }

    calculateYPos() {
        const map = WorldData.getBlockMap()
        const coveredBlocks = Utils.getCoveredBlocks(this.xPos, this.zPos, 0.4)

        // From map get all blocks that are covered by the player and find the highest one
        let highest = 0
        coveredBlocks.forEach(block => {
            if (map[block.x][block.z].height > highest) {
                highest = map[block.x][block.z].height
            }
        })

        return highest
    }

    /**
     * Approximate model Y position to the player Y position
     */
    resolveModelYpos(timeRate: number) {
        this.model.model.position.y = (this.yPos - MyPlayer.playerData.modelYpos)
        this.modelYpos = this.model.model.position.y
    }

    /**
     * Approximate model rotation to the move angle
     */
    resolveModelRotation(timeRate: number) {
        if (!this.moveAngle) return

        const myAngle = this.model.model.rotation.y - this.modelYAngleOffset

        let angleDifference = this.moveAngle - myAngle;
        const rotationSpeed = this.rotationSpeed * timeRate;
        if (angleDifference > Math.PI) {
            angleDifference -= 2 * Math.PI;
        } else if (angleDifference < -Math.PI) {
            angleDifference += 2 * Math.PI;
        }

        if (Math.abs(angleDifference) < rotationSpeed) {
            this.model.model.rotation.y = this.moveAngle + this.modelYAngleOffset;
        } else {
            this.model.model.rotation.y += Math.sign(angleDifference) * rotationSpeed;
        }
        this.modelRotation = this.model.model.rotation.y;
    }
}
