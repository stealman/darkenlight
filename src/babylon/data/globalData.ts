let worldMap: number[][]  = [];

export const Data = {
    setWorldMap(data: number[][]) {
        worldMap = data;
    },

    getWorldMap() {
        return worldMap;
    }
}
