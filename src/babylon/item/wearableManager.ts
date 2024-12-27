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

    async initialize(scene: Scene) {
        const helmModels = [
            new WearableItemModel("helm1", 1, "helm1.babylon", new Vector3(0.46, 0.46, 0.46)),
            new WearableItemModel("helm2", 2, "helm2.babylon", new Vector3(0.46, 0.46, 0.46)) ]

        this.helmetManager = new WearableItemManager("helm", scene, helmModels)
        await this.helmetManager.initialize(scene)

        const armorModels = [
            new WearableItemModel("plate", 1, "armor-plate.babylon", new Vector3(0.42, 0.42, 0.45))]

        this.armorManager = new WearableItemManager("armor", scene, armorModels)
        await this.armorManager.initialize(scene)

        const pauldronModels = [
            new WearableItemModel("pauldron", 1, "pauldron-plate.babylon", new Vector3(0.45, 0.45, 0.45))]

        this.pauldronManager = new WearableItemManager("pauldron", scene, pauldronModels)
        await this.pauldronManager.initialize(scene)
    },

    assignHelmet(node, modelId, scale, nodeOffset) {
        this.helmetManager.assignItem(node, modelId, scale, nodeOffset)
    },

    assignArmor(node, modelId, scale, nodeOffset) {
        this.armorManager.assignItem(node, modelId, scale, nodeOffset)
    },

    assignRightPauldron(node, modelId, scale, nodeOffset) {
        this.pauldronManager.assignItem(node, modelId, scale, nodeOffset)
    },

    onFrame() {
        this.helmetManager.onFrame()
        this.armorManager.onFrame()
        this.pauldronManager.onFrame()
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
            model.mesh.rotation.y = -Math.PI / 2
            model.mesh.position = new Vector3(0, -0.12, 0.065)

            const merged = Mesh.MergeMeshes([model.mesh], false)
            this.sps.addShape(merged!, 2)
            merged!.dispose()

            this.sps.particles.forEach((p) => {
                if (p.isVisible) {
                    p['obj'] = null
                    p['nodeOffset'] = new Vector3(0, 0, 0)
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

            p.position.x = (p.obj.getAbsolutePosition().x) + p.nodeOffset.x
            p.position.z = (p.obj.getAbsolutePosition().z) + p.nodeOffset.z
            p.position.y = (p.obj.getAbsolutePosition().y) + p.nodeOffset.y
        } else if (p.isVisible) {
            p.isVisible = false;
        }
    }

    assignItem(node, itemModelId, scale, nodeOffset) {
        let itemFound = false;
        this.sps.particles.forEach((p) => {
            if (p.itemModelId == itemModelId && p.obj == null) {
                p.obj = node
                p.nodeOffset = nodeOffset
                p.isVisible = true
                //p.uvs = new Vector4(0.5, 0, 1, 1)
                p.uvs = new Vector4(0.1, 0.1, 0.4, 0.9)
                if (scale != null) {
                    p.scaling.x = scale.x
                    p.scaling.y = scale.y
                    p.scaling.z = scale.z
                } else {
                    p.scaling.x = 1
                    p.scaling.y = 1
                    p.scaling.z = 1
                }
                itemFound = true
            }
        })

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
                            p['nodeOffset'] = new Vector3(0, 0, 0)
                            p.isVisible = false
                        }
                    })
                    break
                }
            }
            this.assignItem(node, itemModelId, scale, nodeOffset)
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

    constructor(name: string, itemModelId: number, fileName: string, baseScale: Vector3) {
        this.name = name
        this.itemModelId = itemModelId
        this.fileName = fileName
        this.baseScale = baseScale
    }

    setMesh(mesh: Mesh) {
        this.mesh = mesh
        this.mesh.scaling = this.baseScale
        this.mesh.setEnabled(false)
    }
}
