import {PlayerData} from "@/data/playerlData";
import {Mesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";

export const MyPlayer = {
    playerData: new PlayerData(0, 0, 0, 0),
    scene: null as Scene | null,
    charModel: null as Mesh | null,

    initialize(scene: Scene) {
        this.scene = scene
        this.playerData = new PlayerData(100, 300, 300, 0)

        this.charModel = MeshBuilder.CreateBox("plr", {width: 1, depth: 1, height: 2}, scene);
        this.charModel.position = new Vector3(0, 13.5, 0);
    },

    move(x: number, z: number) {
        this.playerData.xPos -= (x > 0) ? 1 : -1
        this.playerData.zPos -= (z > 0) ? 1 : -1
    },

    setModelYPos(y: number) {
        this.charModel!.position.y = y
    }
}
