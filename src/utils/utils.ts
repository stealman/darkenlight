import { Vector3 } from '@babylonjs/core'
import { TreeManager } from '@/babylon/world/treeManager'

export const Utils = {

    getCoveredBlocks(xPos: number, zPos: number, characterWidth, blockSize = 1) {
        const threshold = blockSize - (characterWidth / 2);

        const coveredBlocks = [];
        for (let x = Math.floor(xPos) -2; x <= Math.ceil(xPos) + 2; x++) {
            for (let z = Math.floor(zPos) -2; z <= Math.ceil(zPos) + 2; z++) {

                if (Math.abs(x - xPos) < threshold && Math.abs(z - zPos) < threshold) {
                    coveredBlocks.push( {x: x, z: z} )
                }

            }
        }

        return coveredBlocks;
    },

    canCharacterMoveToPosition(charSize: number, charPos: Vector3, targetPos: Vector3) {
        if (TreeManager.isPointInTree(targetPos.x, targetPos.z, charSize)) {
            return false
        }

        return true
    },

    getAlternateMovementPos(charBoxSize, moveAngle, charX, charZ, tgtPosX, tgtPosZ, speed, timeRate): Vector3 | null {
        const plusTgtPosX = charX + Math.cos(moveAngle + Math.PI / 4 + Math.PI / 1.5) * speed * timeRate
        const plusTgtPosZ = charZ - Math.sin(moveAngle + Math.PI / 4 + Math.PI / 1.5) * speed * timeRate
        const plusTgtPointDistance = Vector3.Distance(new Vector3(plusTgtPosX, 0, plusTgtPosZ), new Vector3(tgtPosX, 0, tgtPosZ))

        const minusTgtPosX = charX + Math.cos(moveAngle + Math.PI / 4 - Math.PI / 1.5) * speed * timeRate
        const minusTgtPosZ = charZ - Math.sin(moveAngle + Math.PI / 4 - Math.PI / 1.5) * speed * timeRate
        const minusTgtPointDistance = Vector3.Distance(new Vector3(minusTgtPosX, 0, minusTgtPosZ), new Vector3(tgtPosX, 0, tgtPosZ))

        const plusMovePossible = Utils.canCharacterMoveToPosition(charBoxSize, new Vector3(charX, 0, charZ), new Vector3(plusTgtPosX, 0, plusTgtPosZ))
        const minusMovePossible = Utils.canCharacterMoveToPosition(charBoxSize, new Vector3(charX, 0, charZ), new Vector3(minusTgtPosX, 0, minusTgtPosZ))

        if (plusMovePossible && (plusTgtPointDistance <= minusTgtPointDistance || !minusMovePossible)) {
            return new Vector3(plusTgtPosX, 0, plusTgtPosZ)
        }

        if (minusMovePossible && (minusTgtPointDistance < plusTgtPointDistance || !plusMovePossible)) {
            return new Vector3(minusTgtPosX, 0, minusTgtPosZ)
        }

        if (!plusMovePossible && !minusMovePossible) {
            return null
        }
    }
}
