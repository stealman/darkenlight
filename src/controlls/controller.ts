import { Scene, PointerEventTypes, Vector3 } from '@babylonjs/core'
import {MyPlayer} from "@/babylon/character/myPlayer";
import { Settings } from '@/settings/settings'
import { ScreenUtils } from '@/utils/screenUtils'

export const Controller = {
    leftPressedTime: 0,
    rightMousePressedTime: 0,

    initializeController(scene: Scene) {
        scene.onPointerObservable.add((pointerInfo) => {

            // Touch device
            if (Settings.touchEnabled) {
                if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                    this.leftPressedTime = new Date().getTime()
                    this.pointerPressed(pointerInfo)
                }
                if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                    if (new Date().getTime() - this.leftPressedTime < 250) {
                        this.resolveClick(pointerInfo, scene)
                    } else {
                        MyPlayer.setTargetPoint(null)
                    }
                    this.leftPressedTime = 0
                }
            } else {
                // RIGHT MOUSE BUTTON
                if (pointerInfo.type === PointerEventTypes.POINTERDOWN && pointerInfo.event.button === 2) {
                    this.rightMousePressedTime = new Date().getTime()
                    this.pointerPressed(pointerInfo)
                }

                if (pointerInfo.type === PointerEventTypes.POINTERUP && pointerInfo.event.button === 2) {

                    // Mouse right click
                    if (new Date().getTime() - this.rightMousePressedTime < 250) {
                        this.resolveClick(pointerInfo, scene)
                    } else {
                        MyPlayer.setTargetPoint(null)
                    }

                    this.rightMousePressedTime = 0
                }
            }
        })
    },

    resolveClick(pointerInfo, scene) {
        const { clientX, clientY } = pointerInfo.event
        const pickResult = scene.pick(clientX, clientY)
        if (pickResult && pickResult.hit && pickResult.pickedPoint) {
            MyPlayer.setTargetPoint(new Vector3(pickResult.pickedPoint.x, 0, pickResult.pickedPoint.z))
        }
    },

    pointerPressed(pointerInfo) {
        const myCharPosition = ScreenUtils.getScreenPosition(MyPlayer.charModel!)
        const dx = pointerInfo.event.clientX - myCharPosition.x
        const dy = pointerInfo.event.clientY - myCharPosition.y

        const angleRadians = Math.atan2(dy, dx)
        MyPlayer.setTargetPoint(null)
        MyPlayer.setMoveAngle(angleRadians)

    }
}


