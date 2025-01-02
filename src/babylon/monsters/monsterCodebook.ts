import { MonsterModel } from '@/babylon/monsters/monsterModel'

export const MonsterCodebook = {

    getMonsterTypeById(id: number): MonsterType {
        return Object.values(MonsterTypes).find((monsterType: MonsterType) => monsterType.id === id)
    },

    initializeNodesAndAnimations(model: MonsterModel, type: MonsterType) {
        switch (type) {
            case MonsterTypes.Skeleton:
                this.initSkeleton(model)
                break
        }
    },

    initSkeleton(model: MonsterModel) {
        model.helmetNode.attachToBone(model.skeleton.bones.find(b => b.id === "Bone.001"), model.mesh)
        model.lhandNode.attachToBone(model.skeleton.bones.find(b => b.id === "Bone.005"), model.mesh)
        model.rhandNode.attachToBone(model.skeleton.bones.find(b => b.id === "Bone.008"), model.mesh)
    }
}

export const MonsterTypes = {
    Skeleton: { id: 1, name: 'Skeleton' }
}

export class MonsterType {
    id: number
    name: string
}
