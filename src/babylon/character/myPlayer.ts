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
        this.charModel.position = new Vector3(0, 0, 0);
    },

    onFrame() {
        if (this.playerData.moveAngle != null) {
            this.playerData.xPos -= Math.cos(this.playerData.moveAngle + Math.PI / 4) * 0.1
            this.playerData.zPos += Math.sin(this.playerData.moveAngle + Math.PI / 4) * 0.1
        }
    },

    setModelYPos(y: number) {
        this.charModel!.position.y = y
    },

    setMoveAngle(angle: number) {
        this.playerData.moveAngle = angle
    }
}
