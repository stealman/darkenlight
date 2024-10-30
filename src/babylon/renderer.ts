import {
    Engine,
    Scene,
    Vector3,
    FreeCamera,
    PointLight,
    ShadowGenerator, Color3, Color4, RenderTargetTexture,
} from '@babylonjs/core'
import {UnwrapRef} from "vue"
import '@babylonjs/inspector'
import {Debug} from "@babylonjs/core/Legacy/legacy"
import {initializeController} from "@/controlls/controller"
import {MyPlayer} from "@/babylon/character/myPlayer"
import screenFull from 'screenfull'
import {Settings} from "@/settings/settings";
import {WorldRenderer} from "@/babylon/world/worldRenderer";

/**
 * Main Renderer
 */
export const Renderer = {
    initialized: false,
    scene: null as Scene | null,
    engine: null as Engine | null,
    camera: null as FreeCamera | null,

    lastPos: null as Vector3 | null,
    fps: '0' as string,

    shadow: {} as ShadowGenerator,
    light: {} as PointLight,

    initialize(canvasRef: UnwrapRef<HTMLCanvasElement>): { engine: Engine; scene: Scene } {
        this.engine = new Engine(canvasRef, true)
        const engine = this.engine

        // Create the scene
        this.scene = new Scene(this.engine)
        const scene = this.scene
        scene.clearColor = new Color4(0.2, 0.4, 0.2)
        scene.imageProcessingConfiguration.exposure = 1.2

        this.light = new PointLight("pointLight", new Vector3(-20, 50, 15), scene);
        this.light.intensity = 1.5;
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.range = 5000;

        if (!Settings.touchEnabled) {
            this.shadow = new ShadowGenerator(2048, this.light, false);
            this.shadow.bias = 0;
            this.shadow.setDarkness(0.25);
            this.shadow.usePercentageCloserFiltering = true;
            this.shadow.filteringQuality = 2;
            this.shadow.forceBackFacesOnly = true;
            this.shadow.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE
        }

        // Initialize game objects and managers
        initializeController(scene)
        WorldRenderer.initialize(scene, this.shadow)
        this.light.parent = WorldRenderer.worldParentNode

        MyPlayer.initialize(scene)

        // Create the camera
        this.camera = new FreeCamera('camera1', new Vector3(-16, 16, -16), scene)
        this.camera.parent = MyPlayer.charModel
        this.camera.setTarget(new Vector3(0, -2, 0))
        // camera.attachControl(canvasRef, true)

        // Debug layer
        if (!Settings.touchEnabled) {
            scene.debugLayer.show({
                embedMode: true
            })
            const axes = new Debug.AxesViewer(scene, 5)
            axes.xAxis.position = new Vector3(5, 0, 5)
            axes.zAxis.position = new Vector3(5, 0, 5)
            axes.yAxis.dispose()
        }

        // Run the game loop
        this.engine.runRenderLoop(() => {
            this.onFrame(scene)
            scene.render()
        })

        window.addEventListener('resize', () => {
            this.engine?.resize()
        })

        this.initialized = true
        return { engine, scene }
    },

    /**
     * Main game loop
     */
    onFrame(scene: Scene) {
        if (!this.initialized) {
            return
        }
        this.fps = this.engine?.getFps().toFixed();
        this.actualizeDebug()

        MyPlayer.onFrame()

        const pos = MyPlayer.playerData.getPositionRounded()

        // If the player moved, render the world
        if (this.lastPos == null || pos.x !== this.lastPos.x || pos.z !== this.lastPos.z) {
            WorldRenderer.renderWorld()

            this.lastPos = pos

            // Update shadow map
            if (!Settings.touchEnabled) {
                this.shadow.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE
            }
        }
        WorldRenderer.updateWorldParentNode()

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
