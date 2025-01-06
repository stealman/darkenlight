import { MonsterModel } from '@/babylon/monsters/monsterModel'

export const MonsterCodebook = {

    getMonsterTypeById(id: number): MonsterType {
        return Object.values(MonsterTypes).find((monsterType: MonsterType) => monsterType.id === id)
    },

    initializeNodesAndAnimations(model: MonsterModel) {
        switch (model.type) {
            case MonsterTypes.Skeleton:
                this.initSkeleton(model)
                break
        }
    },

    initSkeleton(model: MonsterModel) {
        model.helmetNode.attachToBone(model.skeleton.bones.find(b => b.id === "Bone.001"), model.mesh)
        model.lhandNode.attachToBone(model.skeleton.bones.find(b => b.id === "Bone.005"), model.mesh)
        model.rhandNode.attachToBone(model.skeleton.bones.find(b => b.id === "Bone.008"), model.mesh)

        const animations = [
            { name: "Idle", startFrame: 0, endFrame: 75 },
            { name: "Walk", startFrame: 76, endFrame: 225 }
        ]

        const newAnimationGroups = animations.map(({ name, startFrame, endFrame }) => {
            const newGroup = model.animation.clone(name);
            newGroup.from = startFrame;
            newGroup.to = endFrame;
            return newGroup;
        });

        model.idleAnim = newAnimationGroups[0]
        model.walkAnim = newAnimationGroups[1]
    }
}

export const MonsterTypes = {
    Skeleton: { id: 1, name: 'Skeleton' }
}

export class MonsterType {
    id: number
    name: string
}
