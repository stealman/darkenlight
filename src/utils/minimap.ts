import { MapBlock, WorldData } from '@/babylon/world/worldData'
import { MyPlayer } from '@/babylon/character/myPlayer'

export const MiniMap = {
    offScreenCanvas: null as HTMLCanvasElement | null,
    canvasSize: 100,
    mapWidth: 0,
    mapHeight: 0,

    initialize() {
        const blockMap: MapBlock[][] = WorldData.blockMap
        this.mapWidth = blockMap[0].length
        this.mapHeight = blockMap.length

        // Create an off-screen canvas for the full map
        this.offScreenCanvas = document.createElement("canvas")
        this.offScreenCanvas.width = this.mapWidth
        this.offScreenCanvas.height = this.mapHeight
        const offScreenContext = this.offScreenCanvas.getContext("2d")

        if (!offScreenContext) return

        const dirtColor = "#8B4513"
        const waterColor = "#2222BB"


        // Map with grass colors based on height
        const minHeight = 6
        const maxHeight = 32
        const grassColorMap: string[] = []

        for (let height = minHeight; height <= maxHeight; height++) {
            const brightness = (height - minHeight) / (maxHeight - minHeight)
            const greenValue = Math.round(102 + brightness * (255 - 102))
            grassColorMap[height] = `#00${greenValue.toString(16).padStart(2, '0')}00`
        }

        // Draw the entire map once on the off-screen canvas
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const block = blockMap[y][x]

                if (block.type === 1) {
                    if (block.height >= 5) {
                        offScreenContext.fillStyle = dirtColor
                    } else {
                        offScreenContext.fillStyle = waterColor
                    }
                }

                if (block.type === 2) {
                    offScreenContext.fillStyle = grassColorMap[block.height]
                }
                offScreenContext.fillRect(x, y, 1, 1)
            }
        }
    },

    updateMiniMap() {
        const playerY = MyPlayer.playerData.xPos
        const playerX = MyPlayer.playerData.zPos

        const canvas = document.getElementById("miniMapCanvas") as HTMLCanvasElement
        const context = canvas.getContext("2d")

        if (!context || !this.offScreenCanvas) return
        canvas.width = this.canvasSize
        canvas.height = this.canvasSize

        // Calculate the size needed to fully cover the canvas after rotation (diagonal length)
        const extendedSize = Math.ceil(Math.sqrt(2) * this.canvasSize)
        context.save()

        // Rotate canvas by 135 degrees
        context.translate(this.canvasSize / 2, this.canvasSize / 2)
        context.rotate(-(Math.PI * 3 / 4))  // Rotate by 135 degrees

        // Calculate topleft position of viewport based on player position
        const startX = Math.max(playerX - Math.floor(extendedSize / 2))
        const startY = Math.max(playerY - Math.floor(extendedSize / 2))

        // Draw the larger image on the canvas
        context.drawImage(
            this.offScreenCanvas,
            startX, startY, extendedSize, extendedSize,  // Source x, y, width, height
            -extendedSize / 2, -extendedSize / 2, extendedSize, extendedSize  // Destination x, y, width, height
        )

        // Player position
        context.fillStyle = "red"
        context.beginPath()
        context.arc(0, 0, 2, 0, Math.PI * 2)  // Centered on the canvas
        context.fill()

        // context.restore()
    },

    updateCanvasSize(size) {
        this.canvasSize = size
        document.getElementById("miniMapCanvas").style.width = size + "px"
        document.getElementById("miniMapCanvas").style.height = size + "px"

        this.updateMiniMap()
    }
}
