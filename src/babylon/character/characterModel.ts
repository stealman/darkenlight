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
import { Renderer } from '@/babylon/renderer'

export class CharacterModel {

    model: AbstractMesh | null
    walkAnim: AnimationGroup | undefined
    runAnim: AnimationGroup | undefined
    idleAnim: AnimationGroup | undefined
    actualAnim: AnimationGroup | undefined
    transitionInterval

    constructor(scene: Scene) {
        this.model = null

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
            this.transitionToAnimation(this.walkAnim, 0.1, true, 3)
            this.actualAnim = this.walkAnim
        }
    }

    startRunAnimation() {
        if (this.actualAnim !== this.runAnim) {
            this.transitionToAnimation(this.runAnim, 0.1, true, 3)
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
        if (!targetAnim) return;

        // Clear any ongoing transition interval, stop the current animation and start the target animation
        if (this.transitionInterval !== undefined) {
            clearInterval(this.transitionInterval)
            this.transitionInterval = undefined
            this.actualAnim?.stop()
            targetAnim.start(loop, speed, targetAnim['startFrame'], targetAnim['endFrame'])
            targetAnim.setWeightForAllAnimatables(1)
            return
        }

        let startWeight = 1.0
        let endWeight = 0.0
        const frameRate = Renderer.fps
        const weightChange = 1.0 / (duration * frameRate);

        // Start target animation but set its weight to 0 initially
        targetAnim.start(loop, speed, targetAnim['startFrame'], targetAnim['endFrame'])
        console.log(targetAnim['endFrame'])

        targetAnim.setWeightForAllAnimatables(0)
        this.actualAnim?.setWeightForAllAnimatables(1)

        const actualAnim = this.actualAnim
        this.transitionInterval = setInterval(() => {
            startWeight = Math.max(0, startWeight - weightChange)
            endWeight = Math.min(1, endWeight + weightChange)

            this.actualAnim?.setWeightForAllAnimatables(startWeight)
            targetAnim.setWeightForAllAnimatables(endWeight)

            // End transition when fully transitioned to the target animation
            if (startWeight === 0 && endWeight === 1) {
                actualAnim?.stop()
                clearInterval(this.transitionInterval)
                this.transitionInterval = undefined
            }
        }, 1000 / frameRate)
    }

    rotate(vector: Vector3) {
        if (this.model) {
            this.model.rotation = vector
        }

    }
}
