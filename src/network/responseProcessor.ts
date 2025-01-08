import { PlayerData } from '@/data/playerData'
import { Data } from '@/data/globalData'
import { GameManager } from '@/GameManager'
import { MonsterManager } from '@/babylon/monsters/monsterManager'

export const ResponseProcessor = {

    async processResponse(response) {
        for (let i = 0; i < response.length; i++) {
            const msg = response[i]
            switch (msg.t) {
                case 2: await this.loginResponse(msg); break
                case 3: this.addMonster(msg); break
                case 4: this.monsterMove(msg); break
            }
        }
    },

    async loginResponse(msg) {
        const data = msg.d
        const myChar = new PlayerData(data.hp, data.x, data.z, data.y)
        Data.setMyChar(myChar)
        await GameManager.startGame()
        console.log('Game started')
    },

    addMonster(msg) {
        const data = msg.d
        MonsterManager.addMonster(data.id, data.tp, { x: data.x, z: data.z }, data.hp)
    },

    monsterMove(msg) {
        const data = msg.d
        MonsterManager.monsterMove(data[0], { x: data[1], z: data[2] }, { x: data[3], z: data[4] }, data[5])
    }
}
