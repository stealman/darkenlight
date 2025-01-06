import { MonsterModel } from '@/babylon/monsters/monsterModel'
import { MonsterType } from '@/babylon/monsters/monsterCodebook'
import { WorldData } from '@/babylon/world/worldData'
import { Utils } from '@/utils/utils'
import { Vector3 } from '@babylonjs/core'

export class Monster {
    id: number
    mobType: MonsterType
    model: MonsterModel
    targetPoint: Vector3 | null = null

    hp: number
    runSpeed: number = 1.5
    rotationSpeed: number = 15
    xPos: number
    zPos: number
    yPos: number

    moveAngle: number | null = null

    constructor(id: number, mobType: MonsterType, model: MonsterModel, xPos: number, zPos: number, hp: number) {
        this.id = id
        this.mobType = mobType
        this.model = model
        this.hp = hp
        this.xPos = xPos
        this.zPos = zPos
        this.yPos = 0
    }

    onFrame(timeRate: number, actualTime: number) {
        this.resolveMovement(timeRate)
        this.model.onFrame(timeRate)
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

            this.model.startWalkAnimation()
        } else {
            this.model.stopAnimation()
        }

        this.yPos = this.calculateYPos()
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
}
