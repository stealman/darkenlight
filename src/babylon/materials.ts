import {
    Scene,
    StandardMaterial,
    Color3,
    Texture
} from '@babylonjs/core'
import { CustomMaterial } from '@babylonjs/materials'

export const Materials = {
    BASE_PATH: './assets/materials/',

    getBasicMaterial(scene: Scene, name: string, pathToDiffuse: string): StandardMaterial {
        const mat = new StandardMaterial(name, scene)
        mat.specularColor = new Color3(0, 0, 0)
        mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

        const diffuseTexture = new Texture(pathToDiffuse, scene)
        mat.diffuseTexture = diffuseTexture
        return mat
    },

    getGrassMaterial(scene: Scene): StandardMaterial {
        return this.getBasicMaterial(scene, 'grassMaterial', this.BASE_PATH + 'grass.png')
    },

    getDirtMaterial(scene: Scene): StandardMaterial {
        return this.getBasicMaterial(scene, 'dirtMaterial', this.BASE_PATH + 'dirt.png')
    },

    getTreeWoodMaterial(scene: Scene): StandardMaterial {
        return this.getBasicMaterial(scene, 'treeWoodMaterial', this.BASE_PATH + 'tree_wood_1.png')
    },

    getTerrainMaterial1(scene: Scene): StandardMaterial {
        const diffuseTexture = new Texture('./assets/materials/terrain_materials_1.png', scene)
        diffuseTexture.uScale = 1 / 4
        diffuseTexture.vScale = 1 / 4

        const mat = new CustomMaterial("", scene)
        mat.diffuseTexture = diffuseTexture
        mat.specularColor = new Color3(0, 0, 0)
        mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

        mat.AddAttribute("uvc")
        mat.Vertex_Definitions(`attribute vec2 uvc;`);
        mat.Vertex_Before_PositionUpdated(`uvUpdated += uvc;`)
        return mat
    },

    getPlaneMaterial(scene: Scene): StandardMaterial {
        const diffuseTexture = new Texture('./assets/materials/plane_materials.png', scene)
        diffuseTexture.uScale = 1 / 8
        diffuseTexture.vScale = 1 / 8

        const mat = new CustomMaterial("", scene)
        mat.diffuseTexture = diffuseTexture
        mat.specularColor = new Color3(0, 0, 0)
        mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

        mat.AddAttribute("uvc")
        mat.Vertex_Definitions(`attribute vec2 uvc;`);
        mat.Vertex_Before_PositionUpdated(`uvUpdated += uvc;`)
        return mat
    },

    getSymBlockMaterial1(scene: Scene): StandardMaterial {
        const diffuseTexture = new Texture('./assets/materials/symetric_materials_1.png', scene)
        diffuseTexture.hasAlpha = true
        diffuseTexture.uScale = 1 / 8
        diffuseTexture.vScale = 1 / 8

        const mat = new CustomMaterial("", scene)
        mat.diffuseTexture = diffuseTexture
        mat.specularColor = new Color3(0, 0, 0)
        mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

        mat.AddAttribute("uvc")
        mat.Vertex_Definitions(`attribute vec2 uvc;`);
        mat.Vertex_Before_PositionUpdated(`uvUpdated += uvc;`)
        return mat
    },

    getWaterMaterial(scene: Scene): StandardMaterial {
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

export const MaterialEnum1 = {
    TREE_LEAF_1: new BABYLON.Vector2(0.5, 6.5),
    TREE_LEAF_2: new BABYLON.Vector2(2.5, 6.5),
    TREE_LEAF_3: new BABYLON.Vector2(4.5, 6.5),
    TREE_LEAF_4: new BABYLON.Vector2(6.5, 6.5),
}
