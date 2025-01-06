import { PlayerData } from '@/data/playerData'

export const Data = {
    myChar: null as PlayerData,

    setMyChar(char: PlayerData) {
        this.myChar = char
    }
}
