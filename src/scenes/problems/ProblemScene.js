import Phaser from "phaser";
import autoGrant from "/src/features/inventory/autoGrant.js";

export default class ProblemScene extends Phaser.Scene {
  constructor() {
    super({ key: "ProblemScene" });
  }

  init(data) {
    const json = data.json;
    if (!json) {
      console.error("json undefined!", data);
      return;
    }
    this.returnScene = data.returnScene;
    this.title = json.title;
    this.problem = json.problem;
    this.hint1 = json.hint1;
    this.hint2 = json.hint2;
    this.answer = json.answer;
    this.rewardItem = json.rewardItem || null; // 보상 아이템 (없을 수도 있음)
    if (json.nextScene) {
      this.nextScene = json.nextScene;
    } else { this.nextScene = null; }
    if (json.nextParam) {
      this.nextParam = json.nextParam;
    } else { this.nextParam = null; }
  }

  create() {
    console.log("다음 : " + this.nextScene, this.nextParam + " return : " + this.returnScene);
    const { width: W, height: H } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    this.add.text(W * 0.5, H * 0.5, this.title, { fontSize: "45px", backgroundColor: "#333", color: "#fff", padding: { x: 20, y: 10 } }).setOrigin(0.5);
    this.add.text(W * 0.5, H * 0.4, this.problem, { fontSize: "38px", color: "#fff", wordWrap: { width: W * 0.8 }, align: "center" }).setOrigin(0.5);
    this.add.text(W * 0.5, H * 0.6, "힌트1: " + this.hint1, { fontSize: "34px", color: "#fff", wordWrap: { width: W * 0.8 }, align: "center" }).setOrigin(0.5);
    this.add.text(W * 0.5, H * 0.7, "힌트2: " + this.hint2, { fontSize: "34px", color: "#fff", wordWrap: { width: W * 0.8 }, align: "center" }).setOrigin(0.5);
    this.add.text(W * 0.5, H * 0.8, "정답: " + this.answer, { fontSize: "34px", color: "#fff", wordWrap: { width: W * 0.8 }, align: "center" }).setOrigin(0.5);


    // 터치/클릭 시 다음 씬으로 이동
    this.input.once("pointerdown", () => {

    if (this.rewardItem) {
  autoGrant(this, this.rewardItem, { onceId: `problem:${this.nextParam || this.title}` });
}
      this.scene.start(this.nextScene, {
        json: this.cache.json.get(this.nextParam),
        returnScene: this.returnScene
      });
    });
  }
}
