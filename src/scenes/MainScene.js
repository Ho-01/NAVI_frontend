import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    // JSON 대사 파일 로드
    this.load.json("dialog1", "dialogues/dialog1.json");
    this.load.json("dialog2", "dialogues/dialog2.json");
    
    // 빈 말풍선 이미지
    this.load.image("speech_left", "assets/speech_left.png");
    this.load.image("speech_right", "assets/speech_right.png");
    // 빈 이름표
    this.load.image("name_tag", "assets/name_tag.jpg");

    // 캐릭터 이미지
    this.load.image("haetae", "assets/haetae.png");
    this.load.image("grandpa", "assets/grandpa.png");
    this.load.image("player", "assets/player.png");

    // 배경 이미지
    this.load.image("bg_gwanghwa", "assets/bg_gwanghwa.png");
    this.load.image("bg_seosipjagak", "assets/bg_seosipjagak.png");
  }

  create() {
    // 시작 → 맵으로 이동
    this.scene.start("MapScene");
  }
}
