import { PlayerData } from '@/data/playerData'
import { Data } from '@/data/globalData'
import { GameManager } from '@/GameManager'
import { MonsterManager } from '@/babylon/monsters/monsterManager'
import { TreeManager } from '@/babylon/world/treeManager'

export const ResponseProcessor = {

    async processResponse(response) {
        //console.log(response.length)
        for (let i = 0; i < response.length; i++) {
            const msg = response[i]
            switch (msg.t) {
                case 2: await this.loginResponse(msg.d); break
                case 3: this.addMonster(msg.d); break
                case 4: this.monsterMove(msg.d); break
                case 6: this.charMove(msg.d); break
                case 7: this.processWorldData(msg.d); break
            }
        }
    },

    async loginResponse(data) {
        const myChar = new PlayerData(data.hp, data.x, data.z, data.y)
        Data.setMyChar(myChar)
        await GameManager.startGame()
        console.log('Game started')
    },

    addMonster(data) {
        MonsterManager.addMonster(data.id, data.tp, { x: data.x, z: data.z }, data.hp)
    },

    monsterMove(data) {
        MonsterManager.monsterMove(data[0], { x: data[1], z: data[2] }, { x: data[3], z: data[4] }, data[5])
    },

    charMove(data) {
        // If received my own move, it is desync - take position
        if (data[0] === Data.myChar.id) {
            console.log('Desync')
            Data.myChar.xPos = data[1]
            Data.myChar.zPos = data[2]
            Data.myChar.setMoveAngle(data[3])
            Data.myChar.setActualSpeed(data[4])
        }
    },

    processWorldData(data) {
        data.chunksAround.forEach(chunk => {
            TreeManager.consumeTrees(chunk.trees)
        })
        console.log(data)
    }
}
