import { Scene, Vector3 } from '@babylonjs/core'
import { Monster } from '@/babylon/monsters/monster'
import { MonsterLoader } from '@/babylon/monsters/monsterLoader'
import { MonsterModel } from '@/babylon/monsters/monsterModel'
import { MonsterCodebook } from '@/babylon/monsters/monsterCodebook'

export const MonsterManager = {
    monsters: new Map as Map<number, Monster>,

    async initialize (scene: Scene) {
        await MonsterLoader.initialize(scene)
    },

    addMonster (id: number, type: number, position: { x: number, z: number }, hp: number) {
        if (this.monsters.has(id)) {
            const mob = this.monsters.get(id)
            mob.xPos = position.x
            mob.zPos = position.z
            mob.hp = hp
        } else {
            const monsterType = MonsterCodebook.getMonsterTypeById(type)
            const monsterModel = new MonsterModel(monsterType)
            const monster = new Monster(id, monsterType, monsterModel, position.x, position.z)

            monsterModel.parent = monster
            monsterModel.initializeBonesAndAnimations()

            monsterModel.assignSword(1, 1, new Vector3(0.75, 0.75, 0.75))
            monsterModel.assignHelmet(3, 1)

            this.monsters.set(id, monster)
        }
    },

    onFrame(timeRate: number, actualTime: number) {
        this.monsters.forEach(monster => {
            monster.onFrame(timeRate, actualTime)
        })
    }
}
