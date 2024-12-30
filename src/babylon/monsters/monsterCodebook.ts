export const MonsterCodebook = {

    getMonsterTypeById(id: number): MonsterType {
        return Object.values(MonsterTypes).find((monsterType: MonsterType) => monsterType.id === id)
    }
}


export const MonsterTypes = {
    Skeleton: { id: 1, name: 'Skeleton' }
}

export class MonsterType {
    id: number
    name: string
}
