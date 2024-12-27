import {
    AbstractMesh,
    AnimationGroup,
    Scene,
    SceneLoader, Skeleton, Sound, TransformNode,
    Vector3,
} from '@babylonjs/core'
import { PlayerData } from '@/data/playerlData'
import { Settings } from '@/settings/settings'
import { AudioManager } from '@/babylon/audio/audioManager'
import { Materials } from '@/babylon/materials'
import { WearableManager } from '@/babylon/item/wearableManager'

export class CharacterModel {
    playerData: PlayerData

    model: AbstractMesh
    modelYAngleOffset: number = Math.PI * 1 / 4
    skeleton: Skeleton
    headNode: TransformNode
    torsoNode: TransformNode
    lhandNode: TransformNode
    rhandNode: TransformNode

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
            const material = Materials.getBasicMaterial(scene, "steveMaterial", "/assets/models/steve/default1.jpg", false)
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

            // Torso node
            const torsoBone = this.skeleton.bones.find(b => b.id === "Bone.001")
            this.torsoNode = new TransformNode("torsoNode")
            this.torsoNode.attachToBone(torsoBone, this.model);

            // Head node
            const headBone = this.skeleton.bones.find(b => b.id === "Bone.002")
            this.headNode = new TransformNode("headNode")
            this.headNode.attachToBone(headBone, this.model);

            // Lhand 003
            const lhandBone = this.skeleton.bones.find(b => b.id === "Bone.003")
            this.lhandNode = new TransformNode("lhandNode")
            this.lhandNode.attachToBone(lhandBone, this.model);

            // Rhand 010
            const rhandBone = this.skeleton.bones.find(b => b.id === "Bone.010")
            this.rhandNode = new TransformNode("rhandNode")
            this.rhandNode.attachToBone(rhandBone, this.model);

            //this.assignArmor(1);
            //this.assignHelmet(1);
            this.assignRightPauldron(1);

        }).catch((error) => {
            console.error("Error loading model:", error)
        });
    }

    assignHelmet(type) {
        WearableManager.assignHelmet(this.headNode, type, new Vector3(1, 1, 1), new Vector3(0, 0.42, 0));
    }

    assignArmor(type) {
        WearableManager.assignArmor(this.torsoNode, type, new Vector3(1, 1, 1), new Vector3(-0.01, 0.65, -0.01));
    }

    assignRightPauldron(type) {
        WearableManager.assignRightPauldron(this.rhandNode, type, new Vector3(1, 1, 1), new Vector3(0, 0, 0));
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
