import {
    Engine,
    Scene,
    Vector3,
    FreeCamera,
    PointLight,
    ShadowGenerator, Color3, Color4, RenderTargetTexture
} from '@babylonjs/core'
import {UnwrapRef} from "vue"
import '@babylonjs/inspector'
import {Debug} from "@babylonjs/core/Legacy/legacy"
import { Controller } from '@/controlls/controller'
import {MyPlayer} from "@/babylon/character/myPlayer"
import screenFull from 'screenfull'
import {Settings} from "@/settings/settings";
import {WorldRenderer} from "@/babylon/world/worldRenderer";
import { MiniMap } from '@/utils/minimap'
import { Materials } from '@/babylon/materials'
import { AudioManager } from '@/babylon/audio/audioManager'
import { ViewportManager } from '@/utils/viewport'

/**
 * Main Renderer
 */
export const Renderer = {
    initialized: false,
    scene: null as Scene | null,
    engine: null as Engine | null,
    camera: null as FreeCamera | null,

    lastPos: null as Vector3 | null,
    fps: 0 as number,
    frame: 0 as number,
    lastFrameTime: 0 as number,

    shadow: {} as ShadowGenerator,
    light: {} as PointLight,



    initialize(canvasRef: UnwrapRef<HTMLCanvasElement>): { engine: Engine; scene: Scene } {
        // Antialiasing DISABLED, may be enabled on better devices
        this.engine = new Engine(canvasRef, false)
        const engine = this.engine

        // Create the scene
        this.scene = new Scene(this.engine)
        const scene = this.scene
        scene.clearColor = new Color4(0.2, 0.4, 0.2)
        scene.imageProcessingConfiguration.exposure = 1.2
        scene.skipPointerMovePicking = true
        scene.autoClear = false
        scene.autoClearDepthAndStencil = false

        this.light = new PointLight("pointLight", new Vector3(-20, 50, 15), scene);
        this.light.intensity = 1.0;
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.range = 500;

        if (Settings.shadows) {
            this.shadow = new ShadowGenerator(2048, this.light, false);
            this.shadow.bias = 0;
            this.shadow.setDarkness(0.25);
            this.shadow.usePercentageCloserFiltering = true;
            this.shadow.filteringQuality = 2;
            this.shadow.forceBackFacesOnly = true;
            this.shadow.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE
        }

        // Initialize game objects and managers

        AudioManager.initialize(scene)
        MiniMap.initialize()
        MyPlayer.initialize(scene)

        Controller.initializeController(scene)
        Materials.initialize(scene)
        WorldRenderer.initialize(scene, this.shadow)
        this.light.parent = WorldRenderer.worldParentNode

        // Create the camera
        this.camera = new FreeCamera('camera1', new Vector3(-14, 14, -14), scene)
        this.camera.parent = MyPlayer.charModel!.model
        this.camera.setTarget(new Vector3(0, -4, 0))
        // this.camera.attachControl(canvasRef, true)

        // Debug layer
        if (Settings.debug) {
            scene.debugLayer.show({
                embedMode: true
            })
            /**
            const axes = new Debug.AxesViewer(scene, 5)
            axes.xAxis.position = new Vector3(5, 0, 5)
            axes.zAxis.position = new Vector3(5, 0, 5)
            axes.yAxis.dispose()*/
        }

        // Run the game loop
        this.engine.runRenderLoop(() => {
            this.onFrame(scene)
            scene.render()
        })

        window.addEventListener('resize', () => {
            this.engine?.resize()
            ViewportManager.onResize()
            this.lastPos = null
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
        this.frame++
        const actualTime = new Date().getTime()
        const timeRate = (actualTime - this.lastFrameTime) / 1000
        this.lastFrameTime = actualTime

        this.fps = parseInt(this.engine?.getFps().toFixed());
        this.actualizeDebug()

        MyPlayer.onFrame(timeRate)

        if (this.frame % 150 === 0) {
            MiniMap.updateMiniMap()
        }

        const pos = MyPlayer.playerData.getPositionRounded()

        // If the player moved, render the world
        if (this.lastPos == null || pos.x !== this.lastPos.x || pos.z !== this.lastPos.z) {
            if (ViewportManager.viewPortInitialized) {
                WorldRenderer.renderWorld()
                this.lastPos = pos

                if (Settings.shadows) {
                    this.shadow.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE
                }
            }
        }
        WorldRenderer.updateWorldParentNode()
        scene.render()

        if (!ViewportManager.viewPortInitialized) {
            ViewportManager.calculateViewport(this.camera)
        }
    },

    actualizeDebug() {
        document.getElementById("fpsLabel").innerHTML = "FPS: " + this.fps;
        document.getElementById("posLabel").innerHTML = "POS: " + MyPlayer.playerData.getPositionRounded().toString();
    },

    requestFullscreen() {
        if (screenFull.request) {
            screenFull.request()
        }
    }
}
