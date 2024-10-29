export class PlayerData {
    hp: number
    xPos: number
    zPos: number
    yPos: number

    constructor(hp = 0, xPos = 0, zPos = 0, yPos = 0) {
        this.hp = hp
        this.xPos = xPos
        this.zPos = zPos
        this.yPos = yPos
    }

}
