import {
    AnimationGroup,
    Mesh,
    Skeleton, TransformNode, Vector3,
} from '@babylonjs/core'
import { Monster } from '@/babylon/monsters/monster'
import { MonsterLoader, MonsterTemplate } from '@/babylon/monsters/monsterLoader'
import { MonsterCodebook, MonsterType } from '@/babylon/monsters/monsterCodebook'
import { MyPlayer } from '@/babylon/character/myPlayer'
import { WearableManager } from '@/babylon/item/wearableManager'

export class MonsterModel {
    parent: Monster
    type: MonsterType
    modelTemplate: MonsterTemplate
    mesh: Mesh

    modelYpos: number = 0
    modelRotation: number = 0
    modelYAngleOffset: number = Math.PI * 1 / 4

    skeleton: Skeleton
    helmetNode: TransformNode = new TransformNode("helmetNode")
    lhandNode: TransformNode = new TransformNode("lhandNode")
    rhandNode: TransformNode = new TransformNode("rhandNode")

    walkAnim: AnimationGroup | undefined
    runAnim: AnimationGroup | undefined
    idleAnim: AnimationGroup | undefined

    constructor(monsterType: MonsterType) {
        this.modelTemplate = MonsterLoader.getMonsterClone(monsterType)
        this.mesh = this.modelTemplate.mesh!
        this.skeleton = this.modelTemplate.skeleton!
        this.type = monsterType
    }

    initializeBonesAndAnimations() {
        MonsterCodebook.initializeNodesAndAnimations(this, this.type)
    }

    assignSword(type, materialId, scale = new Vector3(1, 1, 1)) {
        WearableManager.assignSword(this.rhandNode, type, materialId, scale)
    }

    assignHelmet(type, materialId, scale = new Vector3(1, 1, 1)) {
        WearableManager.assignHelmet(this.helmetNode, type, materialId, scale)
    }

    onFrame(timeRate: number) {
        this.resolveMovement(timeRate)
    }

    resolveMovement(timeRate: number) {
        // Set model position base ond xPos and zPos and myPlayer.playerData x and z pos
        this.mesh.position.x = this.parent.xPos - MyPlayer.playerData.xPos
        this.mesh.position.z = this.parent.zPos - MyPlayer.playerData.zPos

        this.resolveModelYpos(timeRate)
        this.resolveModelRotation(timeRate)
    }

    /**
     * Approximate model Y position to the player Y position
     */
    resolveModelYpos(timeRate: number) {
        this.mesh.position.y = (this.parent.yPos - MyPlayer.playerData.modelYpos)
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
}
