// TitleScene.js
import Phaser from "phaser";
import TouchEffect from "../ui/TouchEffect";

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  preload() {
    // 폰트 로드
    document.fonts.load("16px SkyblessingInje");
    document.fonts.load("16px Pretendard");
    // 로고나 이미지 미리 로드
    this.load.image("logo", "assets/logo.png");
    this.load.image("navi_full", "assets/navi_full.png");
    this.load.image("navi_full_touch", "assets/navi_full_touch.png");
  }

  create() {
    const { width, height } = this.scale;

    TouchEffect.init(this); // 터치 이펙트

    this.cameras.main.fadeIn(30, 0, 0, 0); // 진입시 페이드인

    // 배경색
    this.cameras.main.setBackgroundColor("#fffaee");

    // 이미지 (로고용, 임시 사각형)
    const logo = this.add.image(width * 0.5, height*0.4, "logo");
    logo.setDisplaySize(width*0.5, width*0.5);
    logo.setOrigin(0.5);

    // 시작 안내 텍스트 (하단)
    const touchToStart = this.add.text(width*0.5, height*0.85, "touch to start", {
      fontFamily: "Pretendard", fontSize: "10vw", fontStyle: "bold", color: "#000",
    }).setOrigin(0.5);
    this.tweens.add({ targets: touchToStart, alpha: { from: 1, to: 0.2 }, duration: 500, yoyo: true, repeat: -1, hold: 50, repeatDelay: 50, ease: "Quad.easeInOut" });


    // 입력 이벤트: 아무곳이나 클릭/터치하면 다음 씬으로 이동
    this.input.once("pointerdown", () => {
      this.scene.start("LoginScene");
      // this.scene.start("PreloadScene");
    });
  }
}
