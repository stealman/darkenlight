import {
    Mesh,
    Quaternion,
    Scene,
    SceneLoader,
    SolidParticle,
    SolidParticleSystem,
    Vector3, Vector4,
} from '@babylonjs/core'
import { Materials } from '@/babylon/materials'

export const WearableManager = {
    helmetManager: null as WearableItemManager,
    armorManager: null as WearableItemManager,
    pauldronManager: null as WearableItemManager,
    legManager: null as WearableItemManager,

    async initialize(scene: Scene) {
        const helmModels = [
            new WearableItemModel("male-plate-helm1", 1, "helm1.babylon", new Vector3(0.46, 0.46, 0.46), new Vector3(0, 0.42, 0)),
            new WearableItemModel("male-plate-helm2", 2, "helm2.babylon", new Vector3(0.46, 0.46, 0.46), new Vector3(0, 0.42, 0)) ]

        this.helmetManager = new WearableItemManager("helm", scene, helmModels)
        await this.helmetManager.initialize(scene)

        const armorModels = [
            new WearableItemModel("malte-plate-armor", 1, "armor-plate.babylon", new Vector3(0.42, 0.42, 0.42), new Vector3(-0.01, 0.65, 0.03))]

        this.armorManager = new WearableItemManager("armor", scene, armorModels)
        await this.armorManager.initialize(scene)

        const pauldronModels = [
            new WearableItemModel("male-plate-pauldron-left", 1, "pauldron-plate.babylon", new Vector3(0.48, 0.48, 0.52), new Vector3(0, -0.12, 0.065), new Vector3(0, -Math.PI / 2, 0)),
            new WearableItemModel("male-plate-pauldron-right", 2, "pauldron-plate.babylon", new Vector3(0.48, 0.48, 0.52), new Vector3(0, -0.12, -0.05), new Vector3(0, Math.PI / 2, 0))
        ]

        this.pauldronManager = new WearableItemManager("pauldron", scene, pauldronModels)
        await this.pauldronManager.initialize(scene)

        const legModels = [
            new WearableItemModel("plate-legs", 1, "leg-plate.babylon", new Vector3(0.26, 0.26, 0.23), new Vector3(-0.01, -0.1, 0.01))
        ]
        this.legManager = new WearableItemManager("legs", scene, legModels)
        await this.legManager.initialize(scene)

    },

    assignHelmet(node, modelId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.helmetManager.assignItem(node, modelId, scale)
    },

    assignArmor(node, modelId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.armorManager.assignItem(node, modelId, scale)
    },

    assignPauldron(node, modelId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.pauldronManager.assignItem(node, modelId, scale)
    },

    assignLeg(node, modelId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.legManager.assignItem(node, modelId, scale)
    },

    onFrame() {
        this.helmetManager.onFrame()
        this.armorManager.onFrame()
        this.pauldronManager.onFrame()
        this.legManager.onFrame()
    }
}

class WearableItemManager {
    namePrefix: string
    sps: SolidParticleSystem
    spsMesh: Mesh
    models: WearableItemModel[] = []

    constructor(namePrefix: string, scene: Scene, models: WearableItemModel[]) {
        this.namePrefix = namePrefix
        this.sps = new SolidParticleSystem(this.namePrefix + "Sps", scene, { expandable: true })
        this.models = models
    }

    async initialize(scene: Scene) {
        for (const model of this.models) {
            const result = await SceneLoader.ImportMeshAsync("", "/assets/models/equip/", model.fileName, scene);
            model.setMesh(result.meshes[0])
        }
        this.registerLoadedMeshes(scene)
    }

    /**
     * Create SPS particles from loaded meshes
     */
    registerLoadedMeshes(scene: Scene) {
        for (const model of this.models) {
            model.mesh.rotation = model.baseRotation
            model.mesh.position = model.basePosition

            const merged = Mesh.MergeMeshes([model.mesh], false)
            this.sps.addShape(merged!, 2)
            merged!.dispose()

            this.sps.particles.forEach((p) => {
                if (p.isVisible) {
                    p['obj'] = null
                    p['itemModelId'] = model.itemModelId
                    p.isVisible = false
                }
            })
        }

        // Build mesh object
        this.spsMesh = this.sps.buildMesh()
        this.spsMesh.receiveShadows = true
        this.spsMesh.material = Materials.getBasicMaterial(scene, "helmMat", "/assets/models/equip/plate.png", true)
        // this.spsMesh.material.specularColor = Color3.White()

        // Override function that will update particle position on setParticles() call
        this.sps.updateParticle = (particle: SolidParticle) => {
            this.syncParticlePosition(particle)
            return particle
        }

        this.sps.setParticles()
    }

    syncParticlePosition(p: SolidParticle): void {
        if (p.obj != null) {
            const rotq = new Quaternion();
            p.obj.getWorldMatrix().decompose(null, rotq, null);
            p.rotationQuaternion = rotq;
            p.position.copyFrom(p.obj.getAbsolutePosition())
        } else if (p.isVisible) {
            p.isVisible = false;
        }
    }

    assignItem(node, itemModelId, scale) {
        let itemFound = false;

        for (let i = 0; i < this.sps.particles.length; i++) {
            const p = this.sps.particles[i];
            if (p.itemModelId == itemModelId && p.obj == null) {
                p.obj = node
                p.isVisible = true
                // p.uvs = new Vector4(0.5, 0, 1, 1)
                p.uvs = new Vector4(0.1, 0.1, 0.4, 0.9)

                p.scaling.copyFrom(scale)
                itemFound = true
                break
            }
        }

        // If not found, create new particle
        if (!itemFound) {
            for (let i = 0; i < this.models.length; i++) {
                const model = this.models[i];
                if (model.itemModelId === itemModelId) {
                    this.sps.addShape(model.mesh, 3)

                    this.sps.particles.forEach((p) => {
                        if (p.itemModelId === undefined) {
                            p['obj'] = null
                            p['itemModelId'] = itemModelId
                            p.isVisible = false
                        }
                    })
                    break
                }
            }
            this.assignItem(node, itemModelId, scale)
        }

        this.sps.setParticles();
    }

    onFrame() {
        this.sps.setParticles();
    }
}

class WearableItemModel {
    name: string
    itemModelId: number
    mesh: Mesh
    fileName: string
    baseScale: Vector3
    basePosition: Vector3
    baseRotation: Vector3

    constructor(name: string, itemModelId: number, fileName: string, baseScale: Vector3, basePosition: Vector3 = new Vector3(0, 0, 0), baseRotation: Vector3 = new Vector3(0, 0, 0)) {
        this.name = name
        this.itemModelId = itemModelId
        this.fileName = fileName
        this.baseScale = baseScale
        this.basePosition = basePosition
        this.baseRotation = baseRotation
    }

    setMesh(mesh: Mesh) {
        this.mesh = mesh
        this.mesh.scaling = this.baseScale
        this.mesh.setEnabled(false)
    }
}
