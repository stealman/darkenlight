import { Scene } from '@babylonjs/core'
import { Monster } from '@/babylon/monsters/monster'
import { MonsterLoader } from '@/babylon/monsters/monsterLoader'
import { MonsterModel } from '@/babylon/monsters/monsterModel'
import { MonsterCodebook } from '@/babylon/monsters/monsterCodebook'

export const MonsterManager = {
    monsters: Array<Monster>(),

    async initialize (scene: Scene) {
        this.monsters = []
        await MonsterLoader.initialize(scene)
    },

    addMonster (id: number, type: number, position: { x: number, z: number }): Monster {
        const monsterType = MonsterCodebook.getMonsterTypeById(type)
        const monster = new Monster(id, monsterType, new MonsterModel(monsterType), position.x, position.z)
        this.monsters.push(monster)
        return monster
    },

    onFrame(timeRate: number, actualTime: number) {
        this.monsters.forEach(monster => {
            monster.onFrame(timeRate, actualTime)
        })
    }
}
