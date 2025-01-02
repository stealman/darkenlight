import { Scene, Vector3 } from '@babylonjs/core'
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
        const monsterModel = new MonsterModel(monsterType)
        const monster = new Monster(id, monsterType, monsterModel, position.x, position.z)

        monsterModel.parent = monster
        monsterModel.initializeBonesAndAnimations()

        monsterModel.assignSword(1, 1, new Vector3(0.75, 0.75, 0.75))
        monsterModel.assignHelmet(3, 0)

        this.monsters.push(monster)
        return monster
    },

    onFrame(timeRate: number, actualTime: number) {
        this.monsters.forEach(monster => {
            monster.onFrame(timeRate, actualTime)
        })
    }
}
