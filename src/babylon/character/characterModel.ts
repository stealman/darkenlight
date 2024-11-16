import {
    AbstractMesh,
    AnimationGroup,
    Color3,
    Scene,
    SceneLoader,
    StandardMaterial,
    Texture,
    Vector3,
} from '@babylonjs/core'
import { PlayerData } from '@/data/playerlData'

export class CharacterModel {
    playerData: PlayerData

    model: AbstractMesh
    walkAnim: AnimationGroup | undefined
    runAnim: AnimationGroup | undefined
    idleAnim: AnimationGroup | undefined
    actualAnim: AnimationGroup | undefined
    animTransition: AnimTransition | null

    constructor(playerData: PlayerData, scene: Scene) {
        this.playerData = playerData

        SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/steve/",
            "steve.gltf",
            scene
        ).then((result) => {
            this.model = result.meshes[0]
            this.model.scaling = new Vector3(0.25, 0.25, 0.25)
            this.model.rotation = new Vector3(0, 0, 0)


            // Create a new material and load the texture
            const material = new StandardMaterial("steveMaterial", scene)
            material.diffuseTexture = new Texture("/assets/models/steve/default.jpg", scene, {invertY: false})
            material.specularColor = new Color3(0, 0, 0)
            material.emissiveColor = new Color3(0.3, 0.3, 0.3)

            // Apply the material to the model
            this.model.getChildMeshes().forEach((mesh) => {
                mesh.material = material
                mesh.rotation = new Vector3(0, - Math.PI * 5 / 4, 0)
                // Renderer.shadow.addShadowCaster(mesh)
            });

            if (result.animationGroups.length > 0) {

                this.walkAnim = result.animationGroups.find(group => group.name === "Walk")
                if (this.walkAnim) {
                    this.walkAnim['startFrame'] = 4
                    this.walkAnim['endFrame'] = 146
                }

                this.runAnim = result.animationGroups.find(group => group.name === "Run")
                if (this.runAnim) {
                    this.runAnim['startFrame'] = 4
                    this.runAnim['endFrame'] = 146
                }

                this.idleAnim = result.animationGroups.find(group => group.name === "Idle")
                if (this.idleAnim) {
                    this.idleAnim['startFrame'] = 0
                    this.idleAnim['endFrame'] = 60
                }

                this.idleAnim?.start(true, 0.5)
            }
        }).catch((error) => {
            console.error("Error loading model:", error)
        });
    }

    startWalkAnimation() {
        if (this.actualAnim !== this.walkAnim) {
            this.transitionToAnimation(this.walkAnim, 0.15, true, 3)
            this.actualAnim = this.walkAnim
        }
    }

    startRunAnimation() {
        if (this.actualAnim !== this.runAnim) {
            this.transitionToAnimation(this.runAnim, 0.15, true, 3)
            this.actualAnim = this.runAnim
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
                // If the target animation is the same, just return
                return
            }
        }

        this.animTransition = new AnimTransition(duration, this.actualAnim, targetAnim, loop, speed)
    }

    onFrame(timeRate: number) {
        if (this.animTransition) {
            this.animTransition.onFrame(timeRate)
            if (this.animTransition.ended) {
                this.animTransition = null
            }
        }

        if (this.playerData.moveAngle != null) {
            this.resolveModelYpos(timeRate)
            this.resolveModelRotation(timeRate)
        }
    }

    /**
     * Approximate model Y position to the player Y position
     */
    resolveModelYpos(timeRate: number) {
        this.playerData.modelYpos += (this.playerData.yPos - this.playerData.modelYpos) * this.playerData.yMoveSpeed * timeRate
    }

    /**
     * Approximate model rotation to the move angle
     */
    resolveModelRotation(timeRate: number) {
        // Approximate model rotation to the move angle
        let angleDifference = this.playerData.moveAngle - this.model.rotation.y;
        const rotationSpeed = this.playerData.rotationSpeed * timeRate;
        if (angleDifference > Math.PI) {
            angleDifference -= 2 * Math.PI;
        } else if (angleDifference < -Math.PI) {
            angleDifference += 2 * Math.PI;
        }

        if (Math.abs(angleDifference) < rotationSpeed) {
            this.model.rotation.y = this.playerData.moveAngle ? this.playerData.moveAngle : 0;
        } else {
            this.model.rotation.y += Math.sign(angleDifference) * rotationSpeed;
        }
        this.playerData.modelRotation = this.model.rotation.y;
    }
}

class AnimTransition {
    duration: number
    fromAnimation: AnimationGroup
    toAnimation: AnimationGroup
    loop: boolean
    speed: number

    fromWeight: number
    toWeight: number
    ended: boolean

    constructor(duration: number, fromAnimation: AnimationGroup, toAnimation: AnimationGroup, loop = false, speed = 1.0) {
        this.duration = duration
        this.fromAnimation = fromAnimation
        this.toAnimation = toAnimation
        this.loop = loop
        this.speed = speed
        this.ended = false

        this.fromWeight = 1
        this.toWeight = 0

        // Start target animation but set its weight to 0 initially
        this.toAnimation.start(loop, speed, this.toAnimation['startFrame'], this.toAnimation['endFrame'])
        this.toAnimation.setWeightForAllAnimatables(0)
        this.fromAnimation.setWeightForAllAnimatables(1)
    }

    onFrame(timeRate: number) {
        const weightChange = timeRate / this.duration

        this.fromWeight = Math.max(0, this.fromWeight - weightChange)
        this.toWeight = Math.min(1, this.toWeight + weightChange)

        this.fromAnimation.setWeightForAllAnimatables(this.fromWeight)
        this.toAnimation.setWeightForAllAnimatables(this.toWeight)

        if (this.fromWeight === 0 && this.toWeight === 1) {
            this.fromAnimation.stop()
            this.ended = true
        }
    }

    forceEnd() {
        this.fromAnimation.stop()
        this.toAnimation.setWeightForAllAnimatables(1)
    }
}
