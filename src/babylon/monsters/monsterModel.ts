import {
    AnimationGroup,
    Mesh,
    Skeleton, TransformNode, Vector3,
} from '@babylonjs/core'
import { Monster } from '@/babylon/monsters/monster'
import { MonsterLoader, MonsterTemplate } from '@/babylon/monsters/monsterLoader'
import { MonsterCodebook, MonsterType } from '@/babylon/monsters/monsterCodebook'
import { WearableManager } from '@/babylon/item/wearableManager'
import { AnimTransition } from '@/babylon/character/characterModel'
import { Data } from '@/data/globalData'

export class MonsterModel {
    parent: Monster
    type: MonsterType
    // modelTemplate: MonsterTemplate
    mesh: Mesh

    modelYpos: number = 0
    modelRotation: number = 0
    modelYAngleOffset: number = Math.PI * 1 / 4

    skeleton: Skeleton
    animation: AnimationGroup
    helmetNode: TransformNode = new TransformNode("helmetNode")
    lhandNode: TransformNode = new TransformNode("lhandNode")
    rhandNode: TransformNode = new TransformNode("rhandNode")

    walkAnim: AnimationGroup | undefined
    runAnim: AnimationGroup | undefined
    idleAnim: AnimationGroup | undefined

    actualAnim: AnimationGroup | undefined
    animTransition: AnimTransition | null

    constructor(monsterType: MonsterType) {
        const modelTemplate = MonsterLoader.getMonsterClone(monsterType)
        this.mesh = modelTemplate.mesh!
        this.skeleton = modelTemplate.skeleton!
        this.animation = modelTemplate.animation!
        this.type = monsterType
    }

    initializeBonesAndAnimations() {
        MonsterCodebook.initializeNodesAndAnimations(this)
        this.idleAnim?.start(true, 0.5)
        this.actualAnim = this.idleAnim
    }

    assignSword(type, materialId, scale = new Vector3(1, 1, 1)) {
        WearableManager.assignSword(this.rhandNode, type, materialId, scale)
    }

    assignHelmet(type, materialId, scale = new Vector3(1, 1, 1)) {
        WearableManager.assignHelmet(this.helmetNode, type, materialId, scale)
    }

    onFrame(timeRate: number) {
        this.resolveMovement(timeRate)

        if (this.animTransition) {
            this.animTransition.onFrame(timeRate)
            if (this.animTransition.ended) {
                this.animTransition = null
            }
        }
    }

    resolveMovement(timeRate: number) {
        // Set model position base ond xPos and zPos and myPlayer.playerData x and z pos
        this.mesh.position.x = this.parent.xPos - Data.myChar.xPos
        this.mesh.position.z = this.parent.zPos - Data.myChar.zPos

        this.resolveModelYpos(timeRate)
        this.resolveModelRotation(timeRate)
    }

    /**
     * Approximate model Y position to the player Y position
     */
    resolveModelYpos(timeRate: number) {
        this.mesh.position.y = (this.parent.yPos - Data.myChar.modelYpos)
        this.modelYpos = this.mesh.position.y
    }

    /**
     * Approximate model rotation to the move angle
     */
    resolveModelRotation(timeRate: number) {
        if (!this.parent.moveAngle) return

        const myAngle = this.mesh.rotation.y - this.modelYAngleOffset

        let angleDifference = this.parent.moveAngle - myAngle;
        const rotationSpeed = this.parent.rotationSpeed * timeRate;
        if (angleDifference > Math.PI) {
            angleDifference -= 2 * Math.PI;
        } else if (angleDifference < -Math.PI) {
            angleDifference += 2 * Math.PI;
        }

        if (Math.abs(angleDifference) < rotationSpeed) {
            this.mesh.rotation.y = this.parent.moveAngle + this.modelYAngleOffset;
        } else {
            this.mesh.rotation.y += Math.sign(angleDifference) * rotationSpeed;
        }
        this.modelRotation = this.mesh.rotation.y;
    }

    startWalkAnimation() {
        if (this.actualAnim !== this.walkAnim) {
            this.transitionToAnimation(this.walkAnim, 0.15, true, 3)
            this.actualAnim = this.walkAnim
        }
    }

    stopAnimation() {
        if (this.actualAnim !== this.idleAnim) {
            this.transitionToAnimation(this.idleAnim, 0.25, true, 0.5)
            this.actualAnim = this.idleAnim
        }
    }

    transitionToAnimation(targetAnim: AnimationGroup | undefined, duration: number, loop = false, speed = 1.0) {
        if (!this.actualAnim || !targetAnim || this.actualAnim === targetAnim) return;

        // If there is already an ongoing transition
        if (this.animTransition) {
            // Force end the transition if the target animation is different
            if (this.animTransition.toAnimation !== targetAnim) {
                this.animTransition.forceEnd()
            } else {
                return
            }
        }

        this.animTransition = new AnimTransition(duration, this.actualAnim, targetAnim, loop, speed)
    }
}
