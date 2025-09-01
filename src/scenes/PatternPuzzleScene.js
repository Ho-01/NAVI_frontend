// PatternPuzzleScene.js
import Phaser from "phaser";

export default class PatternPuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: "PatternPuzzleScene" });
  }

  init(data) {
    // 정답 패턴: 1~9 사이 정수 배열. 미지정 시 [1,2,3]
    this.answer = Array.isArray(data?.pattern) && data.pattern.length ? data.pattern : [1, 2, 3];
  }

  create() {
    const { width: W, height: H } = this.scale;

    // 안내
    this.add.text(W * 0.5, H * 0.12, "숫자 순서대로 드래그해서 연결하세요", {
      fontSize: Math.round(W * 0.04),
      color: "#333"
    }).setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("LoginScene");
    });
  }
}
