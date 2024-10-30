import { Vector3 } from '@babylonjs/core'

export class PlayerData {
    hp: number
    xPos: number
    zPos: number
    yPos: number
    moveAngle: number | null = null

    constructor(hp = 0, xPos = 0, zPos = 0, yPos = 0) {
        this.hp = hp
        this.xPos = xPos
        this.zPos = zPos
        this.yPos = yPos
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
