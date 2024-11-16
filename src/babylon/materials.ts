import {
    Scene,
    StandardMaterial,
    Color3,
    Texture, Vector2,
} from '@babylonjs/core'
import { CustomMaterial } from '@babylonjs/materials'

export const Materials = {
    BASE_PATH: './assets/materials/',

    terrainMaterial: null as CustomMaterial,
    planeMaterial: null as StandardMaterial,
    symetricBlockMaterial1: null as CustomMaterial,
    waterMaterial: null as StandardMaterial,

    initialize(scene: Scene) {
        this.terrainMaterial = this.createTerrainMaterial1(scene)
        this.planeMaterial = this.createPlaneMaterial(scene)
        this.symetricBlockMaterial1 = this.createSymBlockMaterial1(scene)
        this.waterMaterial = this.createWaterMaterial(scene)
    },

    getBasicMaterial(scene: Scene, name: string, pathToDiffuse: string): StandardMaterial {
        const mat = new StandardMaterial(name, scene)
        mat.specularColor = new Color3(0, 0, 0)
        mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

        const diffuseTexture = new Texture(pathToDiffuse, scene)
        mat.diffuseTexture = diffuseTexture
        return mat
    },

    createTerrainMaterial1(scene: Scene): CustomMaterial {
        return this.getCustomMaterial(scene, 'terrain_materials_1.png', 1 / 4, 1 / 4, false)
    },

    createPlaneMaterial(scene: Scene): StandardMaterial {
        return this.getCustomMaterial(scene, 'plane_materials.png', 1 / 8, 1 / 8, false)
    },

    createSymBlockMaterial1(scene: Scene): CustomMaterial {
        return this.getCustomMaterial(scene, 'symetric_materials_1.png', 1 / 8, 1 / 8, true)
    },

    getCustomMaterial(scene: Scene, textturePath: string, uScale: number, vScale: number, hasAlpha: boolean): CustomMaterial {
        const diffuseTexture = new Texture(this.BASE_PATH + textturePath, scene)
        diffuseTexture.hasAlpha = hasAlpha
        diffuseTexture.uScale = uScale
        diffuseTexture.vScale = vScale

        const mat = new CustomMaterial("", scene)
        mat.diffuseTexture = diffuseTexture
        mat.specularColor = new Color3(0, 0, 0)
        mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

        mat.AddAttribute("uvc")
        mat.Vertex_Definitions(`attribute vec2 uvc;`);
        mat.Vertex_Before_PositionUpdated(`uvUpdated += uvc;`)

        mat.freeze()
        return mat
    },

    createWaterMaterial(scene: Scene): StandardMaterial {
        const mat = new StandardMaterial('waterMaterial', scene)
        mat.specularColor = new Color3(0, 0, 0)

        const texture = new Texture(this.BASE_PATH + 'water.png', scene)
        texture.uScale = 64
        texture.vScale = 64

        mat.diffuseTexture = texture
        mat.alpha = 0.2;
        mat.ambientColor = new Color3(1, 1, 1.0);
        return mat
    },
}

class MaterialEnum {
    index: number
    uv: Vector2

    constructor(index: number, uv: Vector2) {
        this.index = index
        this.uv = uv
    }
}

export const MaterialEnum1 = {
    TREE_LEAF_1: new MaterialEnum(1, new Vector2(0.5, 6.5)),
    TREE_LEAF_2: new MaterialEnum(2, new Vector2(2.5, 6.5)),
    TREE_LEAF_3: new MaterialEnum(3, new Vector2(4.5, 6.5)),
    TREE_LEAF_4: new MaterialEnum(4, new Vector2(6.5, 6.5)),
    WOOD_1: new MaterialEnum(5, new Vector2(0.5, 4.5)),

    getMaterialByIndex(index: number): Vector2 {
        for (const key in MaterialEnum1) {
            if (MaterialEnum1[key].index === index) {
                return MaterialEnum1[key].uv
            }
        }
    }
}

export const TerrainEnum1 = {
    TERRAIN_DIRT: new MaterialEnum(1, new Vector2(2.5, 2.5)),
    TERRAIN_GRASS: new MaterialEnum(2, new Vector2(0.5, 2.5)),

    getTerrainByIndex(index: number): Vector2 {
        return Object.values(TerrainEnum1).find(item => item.index === index)?.uv;
    }
}

export const PlaneEnum1 = {
    PLANE_DIRT: new MaterialEnum(1, new Vector2(2.5, 6.5)),
    PLANE_GRASS: new MaterialEnum(2, new Vector2(0.5, 6.5)),

    getPlaneByIndex(index: number): Vector2 {
        return Object.values(PlaneEnum1).find(item => item.index === index)?.uv;
    }
}
