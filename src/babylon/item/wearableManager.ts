import { AbstractMesh, Mesh, Scene, SceneLoader, Vector3 } from '@babylonjs/core'
import { Materials } from '@/babylon/materials'

export const WearableManager = {
    helmet: null as AbstractMesh,

    async initialize(scene: Scene) {

        SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/equip/",
            "helm1.babylon",
            scene
        ).then((result) => {
            this.helmet = result.meshes[0]
            this.helmet.rotation = new Vector3(-Math.PI / 2, - Math.PI / 2, 0)
            this.helmet.position = new Vector3(0, 1.2, 0)
            this.helmet.scaling = new Vector3(1.8, 1.8, 1.8)

            // Apply material
            const material = Materials.getBasicMaterial(scene, "helmMat", "/assets/models/equip/plate.png", true)

            this.helmet.material = material
            //helm.attachToBone(headBone, this.model)
        }).catch((error) => {
            console.error("Error loading model:", error)
        });
    }
}
