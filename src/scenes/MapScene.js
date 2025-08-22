import Phaser from "phaser";

export default class MapScene extends Phaser.Scene {
  constructor() {
    super("MapScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 200, "맵 화면", {
        fontSize: "32px",
        color: "#fff"
    }).setOrigin(0.5);

    // 대화 버튼 1
    const btn1 = this.add.text(width / 2, height / 2 - 80, "[대화 1 : 서십자각터 앞]", {
        fontSize: "28px",
        backgroundColor: "#333",
        color: "#fff",
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        const json = this.cache.json.get("dialog1");
        this.scene.start("DialogScene", { json, returnScene: "MapScene" });
    });

    // 대화 버튼 2
    const btn2 = this.add.text(width / 2, height / 2 + 80, "[대화 2 : 해태와 만남]", {
        fontSize: "28px",
        backgroundColor: "#333",
        color: "#fff",
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        const json = this.cache.json.get("dialog2");
        this.scene.start("DialogScene", { json, returnScene: "MapScene" });
    });
  }
}
