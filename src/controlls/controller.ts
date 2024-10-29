import { Scene, Vector3, PointerEventTypes } from "@babylonjs/core"
import {MyPlayer} from "@/babylon/character/myPlayer";

export function initializeController(scene: Scene) {
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERDOWN /* pointerInfo.event.button === 2 */) {
            displayLocalCoordinates(pointerInfo, scene)
        }
    })
}

function displayLocalCoordinates(pointerInfo: any, scene: Scene) {
    const pickResult = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY)

    if (pickResult?.hit) {
        const pickedPoint: Vector3 = pickResult.pickedPoint!
        console.log(`Local Coordinates: X=${pickedPoint.x}, Y=${pickedPoint.y}, Z=${pickedPoint.z}`)

        MyPlayer.move(pickedPoint.x, pickedPoint.z)
    } else {
        console.log("No hit detected at this position.")
    }
}
