import {
    AbstractMesh,
    AnimationGroup, Bone, Color3, Mesh,
    Scene,
    SceneLoader, Skeleton, Sound, StandardMaterial,
    Vector3,
} from '@babylonjs/core'
import { PlayerData } from '@/data/playerlData'
import { Settings } from '@/settings/settings'
import { AudioManager } from '@/babylon/audio/audioManager'
import { Materials } from '@/babylon/materials'
import { Builder } from '@/babylon/builder'
import { WearableManager } from '@/babylon/item/wearableManager'

export class CharacterModel {
    playerData: PlayerData

    model: AbstractMesh
    modelYAngleOffset: number = Math.PI * 1 / 4
    skeleton: Skeleton
    headBone: Bone

    walkAnim: AnimationGroup | undefined
    runAnim: AnimationGroup | undefined
    idleAnim: AnimationGroup | undefined
    actualAnim: AnimationGroup | undefined
    animTransition: AnimTransition | null

    footStepSound: Sound | null

    constructor(playerData: PlayerData, scene: Scene) {
        this.playerData = playerData
        this.footStepSound = AudioManager.footStep.clone()

        SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/steve/",
            "steve.gltf",
            scene
        ).then((result) => {
            this.model = result.meshes[0]
            this.model.scaling = new Vector3(0.25, 0.25, 0.25)
            this.model.rotation = new Vector3(0, 0, 0)

            // Apply material
            const material = Materials.getBasicMaterial(scene, "steveMaterial", "/assets/models/steve/default.jpg", false)
            this.model.getChildMeshes().forEach((mesh) => {
                mesh.material = material
                if (Settings.shadows) {
                    // Renderer.shadow.addShadowCaster(mesh)
                    mesh.receiveShadows = true
                }
            });

            // Process animations
            if (result.animationGroups.length > 0) {


                const animationGroup = result.animationGroups[0]; // Assuming there is one animation group
                animationGroup.stop()
                console.log(animationGroup)

                // Define frame ranges for each animation
                const animations = [
                    { name: "Idle", startFrame: 0, endFrame: 75 },
                    { name: "Walk", startFrame: 76, endFrame: 225 },
                    { name: "Run", startFrame: 226, endFrame: 375 }
                ];

                const newAnimationGroups = animations.map(({ name, startFrame, endFrame }) => {
                    const newGroup = animationGroup.clone(name);
                    newGroup.from = startFrame;
                    newGroup.to = endFrame;
                    return newGroup;
                });

                console.log(newAnimationGroups)

                this.walkAnim = newAnimationGroups[1]
                if (this.walkAnim) {
                    this.walkAnim['startFrame'] = 76
                    this.walkAnim['endFrame'] = 220
                }

                this.runAnim = newAnimationGroups[2]
                if (this.runAnim) {
                    this.runAnim['startFrame'] = 226
                    this.runAnim['endFrame'] = 370
                }

                this.idleAnim = newAnimationGroups[0]
                if (this.idleAnim) {
                    this.idleAnim['startFrame'] = 0
                    this.idleAnim['endFrame'] = 75
                }

                this.idleAnim?.start(true, 0.5)
            }

            this.skeleton = result.skeletons[0];
            this.headBone = this.skeleton.bones.find(b => b.id === "Bone.002")
            WearableManager.helm1.attachToBone(this.headBone, this.model)

        }).catch((error) => {
            console.error("Error loading model:", error)
        });
    }

    startWalkAnimation() {
        if (this.actualAnim !== this.walkAnim) {
            this.transitionToAnimation(this.walkAnim, 0.15, true, 3)
            this.actualAnim = this.walkAnim

            this.footStepSound?.setPlaybackRate(0.70)
            if (!this.footStepSound?.isPlaying) {
                this.footStepSound?.play()
            }
        }
    }

    startRunAnimation() {
        if (this.actualAnim !== this.runAnim) {
            this.transitionToAnimation(this.runAnim, 0.15, true, 3)
            this.actualAnim = this.runAnim

            this.footStepSound?.setPlaybackRate(0.78)
            if (!this.footStepSound?.isPlaying) {
                this.footStepSound?.play()
            }
        }
    }

    stopAnimation() {
        if (this.actualAnim !== this.idleAnim) {
            this.transitionToAnimation(this.idleAnim, 0.25, true, 0.5)
            this.actualAnim = this.idleAnim
        }

        if (this.footStepSound?.isPlaying) {
            this.footStepSound?.stop()
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
        const myAngle = this.model.rotation.y - this.modelYAngleOffset

        let angleDifference = this.playerData.moveAngle - myAngle;
        const rotationSpeed = this.playerData.rotationSpeed * timeRate;
        if (angleDifference > Math.PI) {
            angleDifference -= 2 * Math.PI;
        } else if (angleDifference < -Math.PI) {
            angleDifference += 2 * Math.PI;
        }

        if (Math.abs(angleDifference) < rotationSpeed) {
            this.model.rotation.y = this.playerData.moveAngle ? this.playerData.moveAngle + this.modelYAngleOffset : 0;
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
