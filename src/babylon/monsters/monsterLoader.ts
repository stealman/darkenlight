import { Mesh, Scene, SceneLoader, Vector3 } from '@babylonjs/core'
import { Materials } from '@/babylon/materials'
import { Settings } from '@/settings/settings'
import { MonsterType } from '@/babylon/monsters/codebook/monsterCodebook'
import { MonsterTemplate, MonsterTemplates } from '@/babylon/monsters/codebook/monsterTemplates'

export const MonsterLoader = {
    scene: null as Scene,
    monstersMeshes: [] as Mesh[],
    monsterTemplates: new Map<number, MonsterTemplate>(),

    async initialize (scene: Scene) {
        this.scene = scene

        for (const key in MonsterTemplates) {
            await this.loadMonsterMesh(MonsterTemplates[key])
        }
    },

    async loadMonsterMesh (mobType: MonsterTemplate) {

        // Load asset container (passive data used for cloning)
        const result = await SceneLoader.LoadAssetContainerAsync(
            "",
            "/assets/models/monsters/" + mobType.meshName, this.scene!
        )

        const model = result.meshes[0];
        model.scaling = mobType.scale;
        model.rotation = Vector3.Zero()

        const material = Materials.getBasicMaterial(this.scene!, mobType.getMaterialName(), "/assets/models/monsters/" + mobType.textureName, true, false)
        model.getChildMeshes().forEach(mesh => {
            mesh.material = material;
            if (Settings.shadows) {
                 mesh.receiveShadows = true;
            }
        });

        // Set asset container to monsterTemplate
        mobType.setAssetContainer(result)
        this.monsterTemplates.set(mobType.id, mobType)
    },

    getMonsterClone (mobType: MonsterType): MonsterTemplate {
        return this.monsterTemplates.get(mobType.templateId).clone()
    },

    onAnimFrame (animFrame: number) {

        // Animate shared templates
        this.monsterTemplates.forEach((monsterTemplate) => {
            monsterTemplate.assetContainer?.skeletons.forEach((skeleton) => skeleton.prepare())
            monsterTemplate.onAnimFrame(animFrame)
        })
    }
}


