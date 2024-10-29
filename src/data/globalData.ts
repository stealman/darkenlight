let blockMap: number[][]  = [];
const plainMap: number[][]  = [];

export const Data = {
    setWorldMap(data: number[][]) {
        blockMap = data;

        // loop through the blockMap and divide each number by 6 and floor it
        for (let i = 0; i < blockMap.length; i++) {
            for (let j = 0; j < blockMap[i].length; j++) {
                blockMap[i][j] = Math.floor(blockMap[i][j] / 6)
            }
        }
        this.findPlains()
    },

    findPlains() {
        const rows = blockMap.length
        const cols = blockMap[0].length

        // Create a visited array to mark blocks that are already part of a plain
        const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false))

        for (let i = 0; i <= rows - 4; i++) {
            for (let j = 0; j <= cols - 4; j++) {
                // Check if this 4x4 area is valid
                const currentValue = blockMap[i][j]
                let isPlain = true

                // Check all 16 blocks in the 4x4 area
                for (let di = 0; di < 4; di++) {
                    for (let dj = 0; dj < 4; dj++) {
                        if (blockMap[i + di][j + dj] !== currentValue || visited[i + di][j + dj]) {
                            isPlain = false
                            break
                        }
                    }
                    if (!isPlain) break
                }

                // If a plain is found, mark it as visited and store its coordinates
                if (isPlain) {
                    plainMap.push({ x: i, y: j }) // Store top-left corner of the plain

                    // Mark the blocks as visited
                    for (let di = 0; di < 4; di++) {
                        for (let dj = 0; dj < 4; dj++) {
                            visited[i + di][j + dj] = true
                        }
                    }
                }
            }
        }

        console.log(plainMap)
    },

    getPlainMap() {
        return plainMap
    },

    getWorldMap() {
        return blockMap;
    }
}
