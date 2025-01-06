import { AnimationGroup, Mesh, Scene, SceneLoader, Skeleton, Vector3 } from '@babylonjs/core'
import { Materials } from '@/babylon/materials'
import { Settings } from '@/settings/settings'
import { MonsterType } from '@/babylon/monsters/monsterCodebook'

export const MonsterLoader = {
    scene: null as Scene,
    monstersMeshes: [] as Mesh[],
    monsterClones: [],

    async initialize (scene: Scene) {
        this.scene = scene
        this.monsterClones = []
        await this.loadMonsterMesh(MonsterTemplates.Skeleton)
        // await this.loadMonsterMesh(MonsterTypes.ZOMBIE)
    },

    async loadMonsterMesh (mobType: MonsterTemplate) {
        const result = await SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/monsters/",
            mobType.meshName, this.scene!
        )

        const model = result.meshes[0];
        model.scaling = mobType.scale;
        model.rotation = new Vector3(0, 0, 0);

        const material = Materials.getBasicMaterial(this.scene!, mobType.name, "/assets/models/monsters/" + mobType.textureName, true, false)
        model.getChildMeshes().forEach(mesh => {
            mesh.material = material;
            if (Settings.shadows) {
                mesh.receiveShadows = true;
            }
        });

        model.setEnabled(false)
        mobType.mesh = model;
        mobType.skeleton = result.skeletons[0]
        mobType.animation = result.animationGroups[0]
        mobType.animation.stop()
        this.monsterClones[mobType.name] = []
    },

    getMonsterClone (mobType: MonsterType): MonsterTemplate {
        const clones = this.monsterClones[mobType.name]

        let freeClone = null
        if (clones.length > 0) {
            freeClone = clones.pop()
        } else {
            const template: MonsterTemplate = MonsterTemplates[mobType.name]
            freeClone = template.clone(mobType.name + clones.length)
        }

        return freeClone
    }
}

export class MonsterTemplate {
    name: string
    meshName: string
    textureName: string
    scale: Vector3
    mesh: Mesh | null
    skeleton: Skeleton | undefined
    animation: AnimationGroup | undefined

    constructor(name: string, meshName: string, textureName: string, scale: Vector3) {
        this.name = name
        this.meshName = meshName
        this.textureName = textureName
        this.scale = scale
    }

    clone (name: string): MonsterTemplate {
        const clone = new MonsterTemplate(this.name, this.meshName, this.textureName, this.scale)
        clone.mesh = this.mesh!.clone(name)
        clone.mesh!.setEnabled(true)
        clone.skeleton = this.skeleton?.clone(name + "Skeleton")
        clone.animation = this.animation?.clone(name + "Animation")
        return clone
    }
}

export const MonsterTemplates = {
    Skeleton: new MonsterTemplate("Skeleton", "skeleton.gltf", "skeleton.png", new Vector3(0.35, 0.35, 0.35)),
    Zombie: new MonsterTemplate("Zombie", "zombie.gltf", "zombie.png", new Vector3(0.25, 0.25, 0.25))
}


