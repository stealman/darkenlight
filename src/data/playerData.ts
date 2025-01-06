import { Vector3 } from '@babylonjs/core'

export class PlayerData {
    hp: number
    walkSpeed: number = 2.2
    runSpeed: number = 3.5
    xPos: number
    zPos: number
    yPos: number
    modelYpos: number | null = null
    modelRotation: number = 0
    moveAngle: number | null = null
    targetBlock: Vector3 | null = null

    rotationSpeed: number = 15
    yMoveSpeed: number = 15

    lastAttackTime: number = 0
    attackCooldown: number = 1000
    attackAnimationTime: number = 800 // 1000 is base attack time

    constructor(hp = 0, xPos = 0, zPos = 0, yPos = 0) {
        this.hp = hp
        this.xPos = xPos
        this.zPos = zPos
        this.yPos = yPos
        this.modelYpos = yPos
    }

    getPositionRounded(): Vector3 {
        return new Vector3(Math.floor(this.xPos), this.yPos, Math.floor(this.zPos))
    }

    getOffset() {
        return {
            x: this.xPos - Math.floor(this.xPos),
            z: this.zPos - Math.floor(this.zPos)
        }
    }

}
