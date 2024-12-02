import { AbstractMesh, Scene, SceneLoader, SolidParticleSystem, Vector3 } from '@babylonjs/core'
import { Materials } from '@/babylon/materials'

export const WearableManager = {
    helmetSps: null as SolidParticleSystem,
    helm1: null as AbstractMesh,

    async initialize(scene: Scene) {
        const [helm1Result] = await Promise.all([
            SceneLoader.ImportMeshAsync("", "/assets/models/equip/", "helm1.babylon", scene)
        ]);

        this.helm1 = helm1Result.meshes[0];
        this.helm1.rotation = new Vector3(-Math.PI / 2, -Math.PI / 2, 0);
        this.helm1.position = new Vector3(0, 1.2, 0);
        this.helm1.scaling = new Vector3(1.8, 1.8, 1.8);
        const helmMaterial = Materials.getBasicMaterial(scene, "helmMat", "/assets/models/equip/plate.png", true);
        this.helm1.material = helmMaterial;

        // Register loaded meshes
        this.registerLoadedMeshes(scene);
    },

    registerLoadedMeshes(scene: Scene) {
        this.helmetSps = new SolidParticleSystem("helmetSps", scene, {
            //   enableMultiMaterial: true,
            // computeParticleRotation: false,
            //   computeParticleTexture: false
        });

      //  this.helmetSps.addShape(merged, 20, true);
     //   merged.dispose();
    }
}
