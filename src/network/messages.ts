import { Data } from '@/data/globalData'
import { Utils } from '@/utils/utils'

export interface Message {
    t: number
    d: any
}

export class LoginMsg {
    t: number = 1
    login: string
    password: string

    constructor(login: string, password: string) {
        this.login = login
        this.password = password
    }
}

export class MyCharMoveMsg implements Message {
    t: number = 5
    d: any

    constructor() {
        let angle = Data.myChar.getMoveAngle()
        if (angle != null) {
            angle = Utils.roundToTwoDecimals(angle += Math.PI / 4)
        }

        this.d = [Utils.roundToTwoDecimals(Data.myChar.xPos), Utils.roundToTwoDecimals(Data.myChar.zPos), angle, Data.myChar.getActualSpeed()]
    }
}
