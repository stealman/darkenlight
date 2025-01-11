import { BASE_EQUIP_MATERIAL_PATH, EquipItemType } from '@/babylon/item/wearableManager'
import { Materials } from '@/babylon/materials'
import { Scene, Vector3 } from '@babylonjs/core'
import { BabylonUtils } from '@/babylon/utils'
import { CbEquipItemData } from '@/babylon/item/codebook/cbEquipItemData'

export const CbArmorsManager = {
    BASE_ARMORS_PATH: 'armors/',
    scene: null as Scene | null,

    async initHelmets(map: Map<number, EquipItemType>, scene: Scene) {
        this.scene = scene
        map.set(CbHelmets.HELM_SKELETON.id, await this.getItem(CbHelmets.HELM_SKELETON))
    },

    async getItem(data: CbEquipItemData) {
        const item = new EquipItemType(data)
        const material = this.getMaterial(data.texture, data.matsX, data.matsY, data.hasAlpha)
        await item.initializeMesh(this.scene!, this.BASE_ARMORS_PATH + data.model, material, data.pos, data.rot, data.scale)
        return item
    },

    getMaterial(texture: string, matsX: number, matsY: number, hasAlpha: boolean = false) {
        return Materials.getCustomMaterialFrom(this.scene!, BASE_EQUIP_MATERIAL_PATH + this.BASE_ARMORS_PATH, texture + ".png", 1 / (matsX * 2), 1 / (matsY * 2), hasAlpha)
    }
}

export const CbHelmets = {
    HELM_SKELETON: new CbEquipItemData(1751, "1751_helm_skeleton", "helm1", "plate", new Vector3(0, 0.45, 0), new Vector3(0, Math.PI / 2, 0), BabylonUtils.getSymVector(0.42), 4, 2),
}
