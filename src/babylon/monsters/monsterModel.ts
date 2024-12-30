import {
    Mesh,
    Skeleton,
} from '@babylonjs/core'
import { Monster } from '@/babylon/monsters/monster'
import { MonsterLoader } from '@/babylon/monsters/monsterLoader'
import { MonsterType } from '@/babylon/monsters/monsterCodebook'

export class MonsterModel {
    monster: Monster
    model: Mesh
    modelYAngleOffset: number = Math.PI * 1 / 4
    skeleton: Skeleton

    constructor(monsterType: MonsterType) {
        this.model = MonsterLoader.getMonsterClone(monsterType)
    }
}
