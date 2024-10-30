import { Scene, PointerEventTypes } from "@babylonjs/core"
import {MyPlayer} from "@/babylon/character/myPlayer";
import { getScreenPosition } from '@/utils/screenUtils'

export function initializeController(scene: Scene) {
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERDOWN /* pointerInfo.event.button === 2 */) {
            mouseClicked(pointerInfo)
        }
    })
}

function mouseClicked(pointerInfo) {
    const myCharPosition = getScreenPosition(MyPlayer.charModel!)
    const dx = pointerInfo.event.clientX - myCharPosition.x
    const dy = pointerInfo.event.clientY - myCharPosition.y

    const angleRadians = Math.atan2(dy, dx)
    MyPlayer.setMoveAngle(angleRadians)

}
