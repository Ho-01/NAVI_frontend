import Phaser from "phaser";

export default class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: "TestScene" });
  }

  preload(){
    this.load.image("navi_full", "assets/navi_full.png");
    this.load.image("stamp_correct_temp", "/assets/fx/stamp_correct_temp.png");
    this.load.image("stamp_wrong_temp", "/assets/fx/stamp_wrong_temp.png");
    this.load.json("dialog_광화문_1", "json/dialog_광화문_1.json");
  }
  create() {
    const { width: W, height: H } = this.scale;
    // this.scene.start("DialogScene",{json:this.cache.json.get("dialog_광화문_1")});
    window.go("Q02");
  }
}
