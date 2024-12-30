import {PlayerData} from "@/babylon/character/playerlData";
import {
    Scene,
    Vector3,
} from '@babylonjs/core'
import { WorldData } from '@/babylon/world/worldData'
import { CharacterModel } from '@/babylon/character/characterModel'
import { Utils } from '@/utils/utils'

export const MyPlayer = {
    playerData: new PlayerData(0, 0, 0, 0),
    scene: null as Scene | null,
    charModel: null as CharacterModel | null,

    movementType: 'WALK',
    autoAttackActive: false,
    autoAttackEnd: 0,

    initialize(scene: Scene) {
        this.playerData = new PlayerData(100, 355, 570, 0)
        this.charModel = new CharacterModel(this.playerData, scene)
        this.playerData.yPos = this.calculateYPos()
        this.playerData.modelYpos = this.playerData.yPos
    },

    onFrame(timeRate: number, actualTime: number) {
        if (this.autoAttackActive && actualTime - this.playerData.lastAttackTime > this.playerData.attackCooldown && this.autoAttackEnd <= actualTime) {
            this.playerData.lastAttackTime = actualTime
            this.autoAttackEnd = actualTime + this.playerData.attackAnimationTime
            this.charModel?.doAttackAnimation()
        }

        if (this.autoAttackEnd > actualTime) {
            this.charModel?.onFrame(timeRate)
            return
        }

        if (this.playerData.targetBlock != null) {
            const targetBlock = this.playerData.targetBlock
            const dx = Math.abs(targetBlock.x - this.playerData.xPos)
            const dz = Math.abs(targetBlock.z - this.playerData.zPos)

            if (dx < 0.1 && dz < 0.1) {
                this.playerData.targetBlock = null
                this.playerData.moveAngle = null
            }
        }

        if (this.playerData.moveAngle != null) {
            const speed = this.movementType === 'RUN' ? this.playerData.runSpeed : this.playerData.walkSpeed
            this.playerData.xPos += Math.cos(this.playerData.moveAngle + Math.PI / 4) * speed * timeRate
            this.playerData.zPos -= Math.sin(this.playerData.moveAngle + Math.PI / 4) * speed * timeRate
            this.playerData.yPos = this.calculateYPos()

            if (this.movementType === 'RUN') {
                this.charModel?.startRunAnimation()
            } else {
                this.charModel?.startWalkAnimation()
            }
        } else {
            this.charModel?.stopAnimation()
        }

        this.charModel?.onFrame(timeRate)
    },

    calculateYPos() {
        const map = WorldData.getBlockMap()
        const coveredBlocks = Utils.getCoveredBlocks(this.playerData.xPos, this.playerData.zPos, 0.4)

        // From map get all blocks that are covered by the player and find the highest one
        let highest = 0
        coveredBlocks.forEach(block => {
            if (map[block.x][block.z].height > highest) {
                highest = map[block.x][block.z].height
            }
        })

        return highest
    },

    setMoveTypeAngle(movementType: string, angle: number | null) {
        this.playerData.moveAngle = angle
        this.movementType = movementType
    },

    setTargetPoint(point: Vector3 | null) {
        if (point == null) {
            this.playerData.targetBlock = null
            this.playerData.moveAngle = null
        } else {
            point.x += this.playerData.xPos
            point.z += this.playerData.zPos

            // if distance > 3 then movementType is run, otherwise walk
            const distance = Vector3.Distance(point, new Vector3(this.playerData.xPos, 0, this.playerData.zPos))
            this.movementType = distance > 4 ? 'RUN' : 'WALK'

            const angle = Math.atan2(-(point.z - this.playerData.zPos), point.x - this.playerData.xPos)
            this.playerData.moveAngle = angle - Math.PI / 4
            this.playerData.targetBlock = point
        }
    }
}
