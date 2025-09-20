import Phaser from "phaser";

export default class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: "TestScene" });
  }

  preload(){
    this.load.image("navi_full", "assets/navi_full.png");
    this.load.image("stamp_correct_temp", "/assets/fx/stamp_correct_temp.png");
    this.load.image("stamp_wrong_temp", "/assets/fx/stamp_wrong_temp.png");
  }
  create() {
    const { width: W, height: H } = this.scale;
    
    window.go("Q03");
  }
}
