import { Data } from './data/globalData';

export function getWorldMap() {
    // loop through the layers and each tile
    /**
    for (let y = 0; y < layers.length - 1; y++) {
        for (let x = 0; x < layers[y].length; x++) {
            for (let z = 0; z < layers[y][x].length; z++) {
                if (layers[y][x][z] === 1 && (layers[y + 1][x][z] === 1 || layers[y + 1][x][z] === 2 || layers[y + 1][x][z] === 0)) {
                    layers[y][x][z] = 2
                }
            }
        }
    }
*/

    return Data.getWorldMap()
}
