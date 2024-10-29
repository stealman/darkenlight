import {
    Engine,
    Scene,
    Vector3,
    SolidParticleSystem,
    FreeCamera,
    MeshBuilder,
    PointLight,
    ShadowGenerator, Color3, Color4, RenderTargetTexture, Mesh, InstancedMesh, Matrix
} from "@babylonjs/core"
import {UnwrapRef} from "vue"
import {createCube, getDirtMaterial, getGrassMaterial, getWaterMaterial} from "./block.ts"
import '@babylonjs/inspector'
import {getWorldMap} from "./world.ts"
import {Debug} from "@babylonjs/core/Legacy/legacy"
import {initializeController} from "@/controlls/controller"
import {MyPlayer} from "@/babylon/character/myPlayer"
import screenFull from 'screenfull'
import {Settings} from "@/settings/settings";


/**
 * Main Renderer
 */
export const Renderer = {
    initialized: false,
    scene: null as Scene | null,
    engine: null as Engine | null,
    spsGrass: null as SolidParticleSystem | null,
    spsDirt: null as SolidParticleSystem | null,

    lastXpos: 0 as number,
    lastZpos: 0 as number,

    fps: '0' as string,

    grassCube: null as Mesh | null,
    dirtCube: null as Mesh | null,

    grassCubeBuffer: new Float32Array(128 * 16),
    dirtCubeBuffer: new Float32Array(128 * 16),

    shadow: {} as ShadowGenerator,

    initialize(canvasRef: UnwrapRef<HTMLCanvasElement>): { engine: Engine; scene: Scene } {
        this.engine = new Engine(canvasRef, true)
        this.scene = new Scene(this.engine)
        const scene = this.scene
        const engine = this.engine
        scene.clearColor = new Color4(0.2, 0.4, 0.2)
        scene.imageProcessingConfiguration.exposure = 1.2

        const light = new PointLight("pointLight", new Vector3(-25, 25, 20), scene);
        light.intensity = 1.5;
        light.diffuse = new Color3(1, 1, 1);
        light.range = 500;

        if (!Settings.touchEnabled) {
            this.shadow = new ShadowGenerator(1024, light, false);
            this.shadow.bias = 0.000001;
            this.shadow.setDarkness(0.25);
            this.shadow.usePercentageCloserFiltering = true;
            this.shadow.filteringQuality = 2;
            this.shadow.forceBackFacesOnly = true;
            this.shadow.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE
        }

        this.grassCube = createCube(scene)
        this.grassCube.material = getGrassMaterial(scene)

        this.dirtCube = createCube(scene)
        this.dirtCube.material = getDirtMaterial(scene)

        // Water planes
        const plane = MeshBuilder.CreatePlane('plane', {width: 128, height: 128}, scene)
        plane.rotation.x = Math.PI / 2
        plane.material = getWaterMaterial(scene)
        plane.position.y = 0.15

        for (let i = 2.4; i <= 6.5; i += 0.25) {
            const instance = plane.createInstance('plane' + i)
            instance.position.y = i
        }

        this.grassCube.receiveShadows = true
        this.dirtCube.receiveShadows = true

        if (!Settings.touchEnabled) {
            this.shadow.addShadowCaster(this.grassCube)
            this.shadow.addShadowCaster(this.dirtCube)
        }

        this.engine.runRenderLoop(() => {
            this.onFrame(scene)
            scene.render()
        })

        window.addEventListener('resize', () => {
            this.engine?.resize()
        })

        if (!Settings.touchEnabled) {
            scene.debugLayer.show({
                embedMode: true
            })
        }

        const axes = new Debug.AxesViewer(scene, 5)
        axes.xAxis.position = new Vector3(5, 0, 5)
        axes.zAxis.position = new Vector3(5, 0, 5)
        axes.yAxis.dispose()

        initializeController(scene)
        MyPlayer.initialize(scene)

        const camera = new FreeCamera('camera1', new Vector3(-16, 16, -16), scene)
        camera.parent = MyPlayer.charModel
        camera.setTarget(new Vector3(0, -4, 0))
        // camera.attachControl(canvasRef, true)
        light.parent = MyPlayer.charModel

        this.initialized = true
        return { engine, scene }
    },

    onFrame(scene: Scene) {
        if (!this.initialized) {
            return
        }
        this.fps = this.engine?.getFps().toFixed();
        this.actualizeDebug()

        const posX = MyPlayer.playerData.xPos
        const posZ = MyPlayer.playerData.zPos

        if (posX === this.lastXpos && posZ === this.lastZpos) {
            scene.render()
            return
        }

        const map = getWorldMap()

        const grassMatrices = []
        const dirtMatrices = []

        for (let x = posX - 32; x < posX + 32; x++) {
            for (let z = posZ - 32; z < posZ + 32; z++) {
                const yPos = map[x][z]
                const matrix = Matrix.Translation(posX - x, yPos, posZ - z);
                if (yPos < 6) {
                    dirtMatrices.push(matrix)
                } else {
                    grassMatrices.push(matrix)
                }
            }
        }

        if (grassMatrices.length > this.grassCubeBuffer.length / 16) {
            this.grassCubeBuffer = new Float32Array(grassMatrices.length * 16)
        }

        if (dirtMatrices.length > this.dirtCubeBuffer.length / 16) {
            this.dirtCubeBuffer = new Float32Array(dirtMatrices.length * 16)
        }

        grassMatrices.forEach((matrix, index) => {
            matrix.copyToArray(this.grassCubeBuffer, index * 16)
        })

        dirtMatrices.forEach((matrix, index) => {
            matrix.copyToArray(this.dirtCubeBuffer, index * 16)
        })

        this.grassCube?.thinInstanceSetBuffer("matrix", this.grassCubeBuffer, 16)
        this.dirtCube?.thinInstanceSetBuffer("matrix", this.dirtCubeBuffer, 16)

        const posY = 1.5 + map[posX][posZ]
        MyPlayer.setModelYPos(posY)

        this.lastXpos = posX
        this.lastZpos = posZ

        this.shadow.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE
        scene.render()
    },

    actualizeDebug() {
        document.getElementById("fpsLabel").innerHTML = this.fps + " FPS";
    },

    requestFullscreen() {
        if (screenFull.request) {
            screenFull.request()
        }
    }
}
