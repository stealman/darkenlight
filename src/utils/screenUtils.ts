import { Matrix, Vector3 } from '@babylonjs/core'
import { Renderer } from '@/babylon/renderer'
import { MiniMap } from '@/utils/minimap'

export const ScreenUtils = {
    getScreenPosition(mesh) {
        if (Renderer.scene == null || Renderer.camera == null || Renderer.engine == null) {
            return new Vector3(0, 0, 0)
        }

        return Vector3.Project(
            mesh.getAbsolutePosition(),
            Matrix.Identity(),
            Renderer.scene.getTransformMatrix(),
            Renderer.camera.viewport.toGlobal(Renderer.engine.getRenderWidth(), Renderer.engine.getRenderHeight()));
    },

    onResize() {
        const minDisplaySize = Math.min(window.innerHeight, window.innerWidth) / 4
        MiniMap.updateCanvasSize(minDisplaySize)
    }
}
