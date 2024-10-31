import { Vector3 } from '@babylonjs/core'

export class PlayerData {
    hp: number
    moveSpeed: number = 3
    xPos: number
    zPos: number
    yPos: number
    modelYpos: number | null = null
    moveAngle: number | null = null
    targetBlock: Vector3 | null = null

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
