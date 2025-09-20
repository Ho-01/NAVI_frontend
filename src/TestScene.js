import Phaser from "phaser";

export default class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: "TestScene" });
  }

  preload(){
    this.load.image("navi_full", "assets/navi_full.png");
  }
  create() {
    const { width: W, height: H } = this.scale;
    
    window.go("Q02");
  }
}
