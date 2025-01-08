import { AnimationGroup, AssetContainer, Mesh, Scene, SceneLoader, Skeleton, Vector3 } from '@babylonjs/core'
import { Materials } from '@/babylon/materials'
import { Settings } from '@/settings/settings'
import { MonsterType } from '@/babylon/monsters/monsterCodebook'
import { Renderer } from '@/babylon/renderer'

export const MonsterLoader = {
    scene: null as Scene,
    monstersMeshes: [] as Mesh[],
    monsterTemplates: [],

    async initialize (scene: Scene) {
        this.scene = scene
        await this.loadMonsterMesh(MonsterTemplates.Skeleton)
        // await this.loadMonsterMesh(MonsterTypes.ZOMBIE)
    },

    async loadMonsterMesh (mobType: MonsterTemplate) {
        const result = await SceneLoader.LoadAssetContainerAsync(
            "",
            "/assets/models/monsters/" + mobType.meshName, this.scene!
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
        mobType.setAssetContainer(result)
        this.monsterTemplates[mobType.name] = []
    },

    getMonsterClone (mobType: MonsterType): MonsterTemplate {
        return MonsterTemplates[mobType.name].clone(mobType.name)
    },

    onAnimFrame (animFrrame: number) {
        MonsterTemplates.Skeleton.onAnimFrame(animFrrame)
    }
}

export class MonsterTemplate {
    name: string
    meshName: string
    textureName: string
    scale: Vector3

    assetContainer?: AssetContainer

    node: Mesh
    mesh: Mesh
    skeleton: Skeleton
    walkSkeleton: Skeleton
    walkSpeedRatio: number = 4
    animation: AnimationGroup

    clones? = []

    constructor(name: string, meshName: string, textureName: string, walkSpeedRatio: number, scale: Vector3, clones?: []) {
        this.name = name
        this.meshName = meshName
        this.textureName = textureName
        this.scale = scale
        this.clones = clones
    }

    setAssetContainer (assetContainer: AssetContainer) {
        this.assetContainer = assetContainer
        this.assetContainer.animationGroups[0].pause()
    }

    onAnimFrame (animFrame: number) {
        const frameNr = 75 + (animFrame * Renderer.animationSpeedRatio * this.walkSpeedRatio) % 150
        if (this.assetContainer) {
            this.assetContainer.animationGroups[0].goToFrame(frameNr)
        }
    }

    clone (): MonsterTemplate {
        Renderer.unfreezeActiveMeshes()

        const entries = this.assetContainer!.instantiateModelsToScene(undefined, false, {
           doNotInstantiate: true,
        })

        const clone = new MonsterTemplate(this.name, this.meshName, this.textureName, this.walkSpeedRatio, this.scale)
        clone.node = entries.rootNodes[0] as Mesh
        clone.node.alwaysSelectAsActiveMesh = true
        clone.node.setEnabled(true)

        clone.node.getChildMeshes().forEach(mesh => {
            clone.mesh = mesh as Mesh
        })

        clone.skeleton = entries.skeletons[0]
        clone.walkSkeleton = this.assetContainer!.skeletons[0]
        clone.mesh!.skeleton = entries.skeletons[0]

        clone.animation = entries.animationGroups[0]
        clone.animation.play(false)
        clone.animation?.pause()

        this.clones.push(clone)
        return clone
    }
}

export const MonsterTemplates = {
    Skeleton: new MonsterTemplate("Skeleton", "skeleton.gltf", "skeleton.png", 5, new Vector3(0.35, 0.35, 0.35), []),
    Zombie: new MonsterTemplate("Zombie", "zombie.gltf", "zombie.png", 4, new Vector3(0.25, 0.25, 0.25), [])
}


