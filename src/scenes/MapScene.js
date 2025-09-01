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
    const btn1 = this.add.text(width / 2, height / 2 - 200, "[서십자각터, 수상한 할아버지와 만남]", {fontSize: "28px",backgroundColor: "#333",color: "#fff",padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        this.scene.start("DialogScene", { json: this.cache.json.get("dialog1"), returnScene: "MapScene" });
    });

    // 대화 버튼 2
    const btn2 = this.add.text(width / 2, height / 2 - 150, "[광화문 앞, 해태와 첫 만남]", {fontSize: "28px",backgroundColor: "#333",color: "#fff",padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        this.scene.start("DialogScene", { json: this.cache.json.get("dialog3"), returnScene: "MapScene" });
    });

    // 대화 버튼 3
    const btn3 = this.add.text(width / 2, height / 2 - 100, "[광화문 앞, 비겁귀 터치]", {fontSize: "28px",backgroundColor: "#333",color: "#fff",padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        this.scene.start("DialogScene", { json: this.cache.json.get("dialog4"), returnScene: "MapScene" });
    });

    // 대화 버튼 4
    const btn4 = this.add.text(width / 2, height / 2 - 50, "[광화문 앞, 잠긴 광화문 터치]", {fontSize: "28px",backgroundColor: "#333",color: "#fff",padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        this.scene.start("DialogScene", { json: this.cache.json.get("dialog5"), returnScene: "MapScene" });
    });
  }
}
