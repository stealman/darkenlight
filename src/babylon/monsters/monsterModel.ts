import {
    AnimationGroup, Bone, Matrix,
    Mesh, Quaternion,
    Skeleton, Vector3,
} from '@babylonjs/core'
import { Monster } from '@/babylon/monsters/monster'
import { MonsterLoader, MonsterTemplate } from '@/babylon/monsters/monsterLoader'
import { MonsterCodebook, MonsterType } from '@/babylon/monsters/monsterCodebook'
import { Data } from '@/data/globalData'
import { MeshAnimation } from '@/babylon/animations/animation'
import { EquipItem, WearableManager } from '@/babylon/item/wearableManager'

export class MonsterModel {
    parent: Monster
    type: MonsterType
    node: Mesh
    mesh: Mesh

    template: MonsterTemplate
    modelYpos: number = 0
    modelRotation: number = 0
    modelYAngleOffset: number = Math.PI * 1 / 4

    skeleton: Skeleton
    animation: AnimationGroup

    idleAnim: MeshAnimation | undefined
    walkAnim: MeshAnimation | undefined
    runningAnims: Set<MeshAnimation>

    equipSet: Set<EquipItem> = new Set()

    rhandBone: Bone
    lhandBone: Bone
    headBone: Bone
    rhandBoneW: Bone
    lhandBoneW: Bone
    headBoneW: Bone

    rotationQuaternion: Quaternion
    worldMatrix: Matrix

    constructor(monsterType: MonsterType) {
        this.type = monsterType
        this.template = MonsterLoader.getMonsterClone(monsterType)
        this.node = this.template.node
        this.mesh = this.template.mesh
        this.skeleton = this.template.skeleton
        this.animation = this.template.animation
        this.runningAnims = new Set<MeshAnimation>()
    }

    initializeBonesAndAnimations() {
        MonsterCodebook.initializeNodesAndAnimations(this)
    }

    assignSword(type, materialId, scale = new Vector3(1, 1, 1)) {
        this.addEquippedItem(new EquipItem(WearableManager.itemTypes.get(2), this, this.rhandBone, this.rhandBoneW, scale))
    }

    assignHelmet(type, materialId, scale = new Vector3(1, 1, 1)) {
        this.addEquippedItem(new EquipItem(WearableManager.itemTypes.get(1), this, this.headBone, this.headBoneW, scale))
    }

    addEquippedItem(item: EquipItem) {
        this.equipSet.add(item)
        WearableManager.addEquippedItem(item)
    }

    onFrame(timeRate: number) {
        this.resolveMovement(timeRate)

        this.rotationQuaternion = new Quaternion()
        this.worldMatrix = this.mesh.getWorldMatrix();
        this.worldMatrix.decompose(new Vector3(), this.rotationQuaternion, new Vector3());

        this.equipSet.forEach(item => {
            item.onFrame()
        })
    }

    onAnimFrame(animFrame: number) {
        if (this.runningAnims.size > 0) {
            this.skeleton.prepare()

            this.runningAnims.forEach(anim => {
                anim.onAnimFrame(animFrame)
                if (!anim.running) {
                    this.runningAnims.delete(anim)
                }
            })
        }
    }

    resolveMovement(timeRate: number) {
        this.node.position.x = this.parent.xPos - Data.myChar.xPos
        this.node.position.z = this.parent.zPos - Data.myChar.zPos

        this.resolveModelYpos(timeRate)
        this.resolveModelRotation(timeRate)

        // Actualize the world matrix immediately for equpped items to move with the model correctly
        this.mesh.computeWorldMatrix(true)
    }

    /**
     * Approximate model Y position to the player Y position
     */
    resolveModelYpos(timeRate: number) {
        this.node.position.y = (this.parent.yPos - Data.myChar.modelYpos)
        this.modelYpos = this.node.position.y
    }

    /**
     * Approximate model rotation to the move angle
     */
    resolveModelRotation(timeRate: number) {
        if (!this.parent.moveAngle) return

        const myAngle = this.node.rotation.y - this.modelYAngleOffset

        let angleDifference = this.parent.moveAngle - myAngle;
        const rotationSpeed = this.parent.rotationSpeed * timeRate;
        if (angleDifference > Math.PI) {
            angleDifference -= 2 * Math.PI;
        } else if (angleDifference < -Math.PI) {
            angleDifference += 2 * Math.PI;
        }

        if (Math.abs(angleDifference) < rotationSpeed) {
            this.node.rotation.y = this.parent.moveAngle + this.modelYAngleOffset;
        } else {
            this.node.rotation.y += Math.sign(angleDifference) * rotationSpeed;
        }
        this.modelRotation = this.node.rotation.y;
    }

    doWalk() {
        this.mesh.skeleton = this.template.walkSkeleton
        this.equipSet.forEach(item => {
            item.setWalking(true)
        })
        this.runningAnims.clear()
    }

    doIdle() {
        this.mesh.skeleton = this.skeleton
        this.equipSet.forEach(item => {
            item.setWalking(false)
        })
        // this.transitionToAnimation(this.idleAnim!, true, true, 1.0)
    }

    transitionToAnimation(target: MeshAnimation, fadeIn: boolean = false, loop = false, speed = 1.0) {
        this.runningAnims.forEach(anim => {
            if (anim !== target) {
                anim.fadeOut()
            }
        })

        if (!this.runningAnims.has(target!)) {
            this.mesh.skeleton = this.skeleton
            target.start(fadeIn, speed, loop)
            this.runningAnims.add(target)
        }
    }
}
