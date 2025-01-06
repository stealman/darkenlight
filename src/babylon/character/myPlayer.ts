import {
    Scene,
    Vector3,
} from '@babylonjs/core'
import { WorldData } from '@/babylon/world/worldData'
import { CharacterModel } from '@/babylon/character/characterModel'
import { Utils } from '@/utils/utils'
import { Data } from '@/data/globalData'

export const MyPlayer = {
    scene: null as Scene | null,
    charModel: null as CharacterModel | null,

    movementType: 'WALK',
    boxSize: 0.6,
    autoAttackActive: false,
    autoAttackEnd: 0,

    initialize(scene: Scene) {
        this.charModel = new CharacterModel(Data.myChar, scene)
        Data.myChar.yPos = this.calculateYPos()
        Data.myChar.modelYpos = Data.myChar.yPos
    },

    onFrame(timeRate: number, actualTime: number) {
        if (this.autoAttackActive && actualTime - Data.myChar.lastAttackTime > Data.myChar.attackCooldown && this.autoAttackEnd <= actualTime) {
            Data.myChar.lastAttackTime = actualTime
            this.autoAttackEnd = actualTime + Data.myChar.attackAnimationTime
            this.charModel?.doAttackAnimation()
        }

        if (this.autoAttackEnd > actualTime) {
            this.charModel?.onFrame(timeRate)
            return
        }

        if (Data.myChar.targetBlock != null) {
            const targetBlock = Data.myChar.targetBlock
            const dx = Math.abs(targetBlock.x - Data.myChar.xPos)
            const dz = Math.abs(targetBlock.z - Data.myChar.zPos)

            if (dx < 0.1 && dz < 0.1) {
                Data.myChar.targetBlock = null
                Data.myChar.moveAngle = null
            }
        }

        if (Data.myChar.moveAngle != null) {
            const speed = this.movementType === 'RUN' ? Data.myChar.runSpeed : Data.myChar.walkSpeed
            let tgtPos = new Vector3(Data.myChar.xPos + Math.cos(Data.myChar.moveAngle + Math.PI / 4) * speed * timeRate, 0, Data.myChar.zPos -Math.sin(Data.myChar.moveAngle + Math.PI / 4) * speed * timeRate)

            // Check if player can move to the target position, if not try to find an alternate position
            if (!Utils.canCharacterMoveToPosition(this.boxSize, new Vector3(Data.myChar.xPos, 0, Data.myChar.zPos), tgtPos)) {
                const alternateMovementPos = Utils.getAlternateMovementPos(this.boxSize, Data.myChar.moveAngle, Data.myChar.xPos, Data.myChar.zPos, tgtPos.x, tgtPos.z, speed, timeRate)
                if (alternateMovementPos != null) {
                    tgtPos = alternateMovementPos
                } else {
                    tgtPos = new Vector3(Data.myChar.xPos, 0, Data.myChar.zPos)
                }
            }

            Data.myChar.xPos = tgtPos.x
            Data.myChar.zPos = tgtPos.z
            Data.myChar.yPos = this.calculateYPos()

            if (this.movementType === 'RUN') { this.charModel?.startRunAnimation() }
            if (this.movementType === 'WALK') { this.charModel?.startWalkAnimation() }
        } else {
            this.charModel?.stopAnimation()
        }

        this.charModel?.onFrame(timeRate)
    },

    calculateYPos() {
        const map = WorldData.getBlockMap()
        const coveredBlocks = Utils.getCoveredBlocks(Data.myChar.xPos, Data.myChar.zPos, this.boxSize)

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
        Data.myChar.moveAngle = angle
        this.movementType = movementType
    },

    setTargetPoint(point: Vector3 | null) {
        if (point == null) {
            Data.myChar.targetBlock = null
            Data.myChar.moveAngle = null
        } else {
            point.x += Data.myChar.xPos
            point.z += Data.myChar.zPos

            // if distance > 3 then movementType is run, otherwise walk
            const distance = Vector3.Distance(point, new Vector3(Data.myChar.xPos, 0, Data.myChar.zPos))
            this.movementType = distance > 4 ? 'RUN' : 'WALK'

            const angle = Math.atan2(-(point.z - Data.myChar.zPos), point.x - Data.myChar.xPos)
            Data.myChar.moveAngle = angle - Math.PI / 4
            Data.myChar.targetBlock = point
        }
    }
}
