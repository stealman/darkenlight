import { Mesh, Scene, SceneLoader, Vector3 } from '@babylonjs/core'
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
        this.monsterClones[mobType.name] = []
    },

    getMonsterClone (mobType: MonsterType): Mesh {
        const clones = this.monsterClones[mobType.name]

        let freeClone = null
        if (clones.length > 0) {
            freeClone = clones.pop()
        } else {
            const template = MonsterTemplates[mobType.name]
            freeClone = template.mesh!.clone(mobType.name + clones.length)
        }

        freeClone.setEnabled(true)
        return freeClone
    }
}

export const MonsterTemplates = {
    Skeleton: {
        name: "Skeleton",
        meshName: "skeleton.gltf",
        textureName: "skeleton.png",
        scale: new Vector3(0.05, 0.05, 0.05),
        mesh: null
    },
    Zombie: {
        name: "Zombie",
        meshName: "zombie.babylon",
        textureName: "zombie.png",
        scale: new Vector3(0.25, 0.25, 0.25),
        mesh: null
    }
}

export class MonsterTemplate {
    name: string
    meshName: string
    textureName: string
    scale: Vector3
    mesh: Mesh | null
}
