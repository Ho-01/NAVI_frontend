import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    // JSON 대사 파일 로드
    this.load.json("dialog1", "dialogues/dialog1.json");
    this.load.json("dialog2", "dialogues/dialog2.json");
    this.load.json("dialog3", "dialogues/dialog3.json");
    this.load.json("dialog4", "dialogues/dialog4.json");
    this.load.json("dialog5", "dialogues/dialog5.json");
    // JSON 컷신 파일 로드
    this.load.json("cutscene1", "dialogues/cutscene1.json");
    this.load.json("cutscene2", "dialogues/cutscene2.json");
    // 컷씬 이미지
    this.load.image("cutscene1", "assets/cutscenes/cutscene1.png");
    this.load.image("cutscene2", "assets/cutscenes/cutscene2.png");
    // 빈 말풍선 이미지
    this.load.image("speech_left", "assets/speech_left.png");
    this.load.image("speech_right", "assets/speech_right.png");
    // 빈 이름표
    this.load.image("name_tag", "assets/name_tag.jpg");

    // 캐릭터 이미지
    this.load.image("player", "assets/player.png");
    this.load.image("???", "assets/grandpa.png");
    this.load.image("세종의 영혼", "assets/sejong.png");
    this.load.image("해태", "assets/haetae.png");
    this.load.image("비겁귀", "assets/비겁귀.png");
    

    // 배경 이미지
    this.load.image("bg_광화문", "assets/bg_gwanghwa.png");
    this.load.image("bg_서십자각터", "assets/bg_seosipjagak.png");
  }

  create() {
    // 시작 → 맵으로 이동
    this.scene.start("MapScene");
  }
}
