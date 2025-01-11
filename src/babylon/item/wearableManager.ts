import {
    Bone, Matrix,
    Mesh,
    Quaternion,
    Scene,
    SceneLoader,
    SolidParticle,
    SolidParticleSystem, Vector2,
    Vector3, Vector4,
} from '@babylonjs/core'
import { Materials } from '@/babylon/materials'
import { MonsterModel } from '@/babylon/monsters/monsterModel'
import { CustomMaterial } from '@babylonjs/materials'
import { CbWeaponsManager } from '@/babylon/item/codebook/cbWeapons'
import { CbArmorsManager } from '@/babylon/item/codebook/cbArmors'
import { CbEquipItemData } from '@/babylon/item/codebook/cbEquipItemData'

export const BASE_EQUIP_MATERIAL_PATH = "/assets/models/equip/"

export const WearableManager = {
    helmetManager: null as WearableItemManager,
    armorManager: null as WearableItemManager,
    pauldronManager: null as WearableItemManager,
    legManager: null as WearableItemManager,
    swordManager: null as WearableItemManager,

    itemTypes: new Map<number, EquipItemType>(),
    equippedItems: new Map<EquipItemType, Set<EquipItem>>(),

    colorVec: new Vector2(0, 0),

    async initialize(scene: Scene) {
        await CbWeaponsManager.initMelee(this.itemTypes, scene)
        await CbArmorsManager.initHelmets(this.itemTypes, scene)


        const helmModels = [
            new WearableItemModel("male-plate-helm1", 1, "helm1.babylon", new Vector3(0.46, 0.46, 0.46), new Vector3(0, 0.42, 0)),
            new WearableItemModel("male-plate-helm2", 2, "helm2.babylon", new Vector3(0.46, 0.46, 0.46), new Vector3(0, 0.42, 0)),
            ]

        this.helmetManager = new WearableItemManager("helm", scene, helmModels, "/assets/models/equip/plate.png")
        await this.helmetManager.initialize(scene)

        const armorModels = [
            new WearableItemModel("malte-plate-armor", 1, "armor-plate.babylon", new Vector3(0.42, 0.42, 0.42), new Vector3(-0.01, 0.65, 0.03))]

        this.armorManager = new WearableItemManager("armor", scene, armorModels, "/assets/models/equip/plate.png")
        await this.armorManager.initialize(scene)

        const pauldronModels = [
            new WearableItemModel("male-plate-pauldron-left", 1, "pauldron-plate.babylon", new Vector3(0.48, 0.48, 0.52), new Vector3(0, -0.12, 0.065), new Vector3(0, -Math.PI / 2, 0)),
            new WearableItemModel("male-plate-pauldron-right", 2, "pauldron-plate.babylon", new Vector3(0.48, 0.48, 0.52), new Vector3(0, -0.12, -0.05), new Vector3(0, Math.PI / 2, 0))
        ]

        this.pauldronManager = new WearableItemManager("pauldron", scene, pauldronModels, "/assets/models/equip/plate.png")
        await this.pauldronManager.initialize(scene)

        const legModels = [
            new WearableItemModel("plate-legs", 1, "leg-plate.babylon", new Vector3(0.26, 0.26, 0.23), new Vector3(-0.01, -0.1, 0.01))
        ]
        this.legManager = new WearableItemManager("legs", scene, legModels, "/assets/models/equip/plate.png")
        await this.legManager.initialize(scene)

        const swordModels = [
            new WearableItemModel("sword", 1, "weapons/sword1.babylon", new Vector3(5, 5, 5), new Vector3(0.01, 0.1, 0), new Vector3(0, Math.PI / 2, Math.PI / 2))
        ]
        this.swordManager = new WearableItemManager("sword", scene, swordModels, "/assets/models/equip/weapons/swords.png")
        await this.swordManager.initialize(scene)
    },

    assignHelmet(node, modelId, materialId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.helmetManager.assignItem(node, modelId, PlateArmorMaterials[materialId], scale)
    },

    assignArmor(node, modelId, materialId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.armorManager.assignItem(node, modelId, PlateArmorMaterials[materialId], scale)
    },

    assignPauldron(node, modelId, materialId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.pauldronManager.assignItem(node, modelId, PlateArmorMaterials[materialId], scale)
    },

    assignLeg(node, modelId, materialId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.legManager.assignItem(node, modelId, PlateArmorMaterials[materialId], scale)
    },

    assignSword(node, modelId, materialId, scale: Vector3 = new Vector3(1, 1, 1)) {
        this.swordManager.assignItem(node, modelId, SwordMaterials.longsword_mythril, scale)
    },

    addEquippedItem(item: EquipItem) {
        if (!this.equippedItems.has(item.type)) {
            this.equippedItems.set(item.type, new Set())
        }
        this.equippedItems.get(item.type)!.add(item)
        item.type.updateCount(this.equippedItems.get(item.type)!.size)
    },

    removeEquippedItem(item: EquipItem) {
        this.equippedItems.get(item.type)?.delete(item)
        item.type.updateCount(this.equippedItems.get(item.type)!.size)
    },

    onFrame() {
        this.helmetManager.onFrame()
        this.armorManager.onFrame()
        this.pauldronManager.onFrame()
        this.legManager.onFrame()
        this.swordManager.onFrame()

        // For each item type, if at least one item is equipped, update the instance buffer
        this.equippedItems.forEach((items, type) => {
            if (type.count > 0) {
                // console.log(items.size)

                let i = 0;

                // Every item has its position and rotation set in its onFrame() method
                items.forEach((item) => {
                    const posMatrix = Matrix.Translation(item.position.x, item.position.y, item.position.z);
                    const scaleMatrix = Matrix.Scaling(item.scale.x, item.scale.y, item.scale.z);
                    scaleMatrix.multiply(Matrix.FromQuaternionToRef(item.quaternion, new Matrix()).multiply(posMatrix)).copyToArray(type.instanceBuffer, i * 16);

                    type.uvBuffer[i * 2] = item.matVector.x
                    type.uvBuffer[i * 2 + 1] = item.matVector.y
                    i++;
                })
                type.mesh.thinInstanceSetBuffer("matrix", type.instanceBuffer);
                type.mesh.thinInstanceSetBuffer("uvc", type.uvBuffer, 2)
            }
        })
    }
}

class WearableItemManager {
    namePrefix: string
    sps: SolidParticleSystem
    spsMesh: Mesh
    models: WearableItemModel[] = []
    texturePath: string
    scene: Scene

    constructor(namePrefix: string, scene: Scene, models: WearableItemModel[], texturePath: string) {
        this.namePrefix = namePrefix
        this.sps = new SolidParticleSystem(this.namePrefix + "Sps", scene, { expandable: true })
        this.models = models
        this.texturePath = texturePath
        this.scene = scene
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
            this.addModelMeshToSps(model)

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
        this.spsMesh.material = Materials.getBasicMaterial(scene, this.namePrefix + "Mat", this.texturePath , false, true)
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

    assignItem(node, itemModelId, uvs, scale) {
        let itemFound = false;

        for (let i = 0; i < this.sps.particles.length; i++) {
            const p = this.sps.particles[i];
            if (p.itemModelId == itemModelId && p.obj == null) {
                p.obj = node
                p.isVisible = true
                p.uvs = uvs

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
                    this.addModelMeshToSps(model)

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
            this.spsMesh = this.sps.buildMesh()
            this.assignItem(node, itemModelId, uvs, scale)
        }

        this.sps.setParticles();
    }

    addModelMeshToSps(model: WearableItemModel) {
        model.mesh.rotation = model.baseRotation
        model.mesh.position = model.basePosition

        const merged = Mesh.MergeMeshes([model.mesh], false)
        this.sps.addShape(merged!, 1)
        merged!.dispose()
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

const PlateArmorMaterials = [
    new Vector4(0.1, 0, 0.4, 1), // Iron
    new Vector4(0.5, 0, 1, 1), // Mythril
]

const SwordMaterials = {
    longsword_iron : new Vector4(0, 5/6, 0.5, 1),
    longsword_mythril : new Vector4(0.5, 5/6, 1, 1),
}

export class EquipItem {
    parent: MonsterModel = null as MonsterModel
    type: EquipItemType
    matVector: Vector2

    position: Vector3
    quaternion: Quaternion
    bone: Bone
    walkingBone: Bone
    activeBone: Bone
    scale: Vector3

    localPosition: Vector3 = Vector3.Zero()
    boneRotationQuaternion: Quaternion = Quaternion.Identity()
    localScale: Vector3 = Vector3.One()

    constructor(type: EquipItemType, matIndex: number, parent, bone: Bone, walkingBone: Bone, scale: Vector3 = Vector3.One()) {
        this.type = type
        this.parent = parent
        this.bone = bone
        this.walkingBone = walkingBone
        this.activeBone = this.bone
        this.scale = scale

        const matRow = (type.cbData.matsY * 2) - ((Math.floor(matIndex / type.cbData.matsX) * 2) + 1.5)
        const matCol = ((matIndex % type.cbData.matsX) * 2) + 0.5
        this.matVector = new Vector2(matCol, matRow)
    }

    onFrame() {
        this.activeBone.computeWorldMatrix(true);
        this.activeBone.getWorldMatrix().decompose(this.localScale, this.boneRotationQuaternion, this.localPosition);

        this.quaternion = this.parent.rotationQuaternion.multiply(this.boneRotationQuaternion);
        this.position = Vector3.TransformCoordinates(this.localPosition, this.parent.worldMatrix);
    }

    setWalking(isWalking: boolean) {
        this.activeBone = isWalking ? this.walkingBone : this.bone
    }
}

export class EquipItemType {
    id: number
    name: string
    mesh: Mesh
    count: number = 0

    instanceBuffer: Float32Array
    uvBuffer: Float32Array

    cbData: CbEquipItemData

    constructor(data: CbEquipItemData) {
        this.id = data.id
        this.cbData = data
    }

    async initializeMesh(scene: Scene, fileName: string, material: CustomMaterial, position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One()) {
        const result = await SceneLoader.ImportMeshAsync("", "/assets/models/equip/", fileName + ".babylon", scene);
        const source = result.meshes[0] as Mesh

        source.position = position
        source.rotation = rotation
        source.scaling = scale

        this.mesh = Mesh.MergeMeshes([source], true)!
        this.mesh.material = material
        this.mesh.setEnabled(false)
        this.mesh.alwaysSelectAsActiveMesh = true
    }

    updateCount(count: number) {
        this.count = count
        this.instanceBuffer = new Float32Array(16 * count)
        this.uvBuffer = new Float32Array(2 * count)

        if (count === 0) {
            this.mesh.setEnabled(false)
        } else if (!this.mesh.isEnabled()) {
            this.mesh.alwaysSelectAsActiveMesh = true
            this.mesh.setEnabled(true)
        }
    }
}
