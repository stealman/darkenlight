import { MonsterModel } from '@/babylon/monsters/monsterModel'
import { MeshAnimation } from '@/babylon/animations/animation'

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
        model.headBone = model.skeleton.bones.find(b => b.id === "Bone.001")
        model.lhandBone = model.skeleton.bones.find(b => b.id === "Bone.005")
        model.rhandBone = model.skeleton.bones.find(b => b.id === "Bone.008")

        model.headBoneW = model.template.walkSkeleton.bones.find(b => b.id === "Bone.001")!
        model.lhandBoneW = model.template.walkSkeleton.bones.find(b => b.id === "Bone.005")!
        model.rhandBoneW = model.template.walkSkeleton.bones.find(b => b.id === "Bone.008")!

        const animations = [
            { name: "Idle", startFrame: 0, endFrame: 75 },
            { name: "Walk", startFrame: 76, endFrame: 225 }
        ]

        const groups = animations.map(({ name, startFrame, endFrame }) => {
            return new MeshAnimation(model.animation.clone(name + Math.random(), undefined, true), startFrame, endFrame)
        });

        model.idleAnim = groups[0]
        model.walkAnim = groups[1]
    }
}

export const MonsterTypes = {
    Skeleton: { id: 1, name: 'Skeleton' }
}

export class MonsterType {
    id: number
    name: string
}
