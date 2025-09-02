import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    // JSON 대사 파일 로드
    this.load.json("dialog1", "json/dialog1.json");
    this.load.json("dialog2", "json/dialog2.json");
    this.load.json("dialog3", "json/dialog3.json");
    this.load.json("dialog4", "json/dialog4.json");
    this.load.json("dialog5", "json/dialog5.json");
    // JSON 컷씬 파일 로드
    this.load.json("cutscene1", "json/cutscene1.json");
    this.load.json("cutscene2", "json/cutscene2.json");
    // JSON 맵 이동 파일 로드
    this.load.json("move1", "json/move1.json");
    // JSON 튜토리얼 파일 로드
    this.load.json("tutorial1", "json/tutorial1.json");
    // 튜토리얼 이미지
    this.load.image("tutorial1_1", "assets/tutorials/tutorial1_1.png");
    this.load.image("tutorial1_2", "assets/tutorials/tutorial1_2.png");
    this.load.image("tutorial1_3", "assets/tutorials/tutorial1_3.png");
    // 컷씬 이미지
    this.load.image("cutscene1", "assets/cutscenes/cutscene1.png");
    this.load.image("cutscene2", "assets/cutscenes/cutscene2.png");
    
    // 이 아래로는 첫로딩때 한번에 로드할것
    this.load.image("move", "assets/move.png");
    // 빈 말풍선 이미지
    this.load.image("speech_left", "assets/speech_left.png");
    this.load.image("speech_right", "assets/speech_right.png");
    // 빈 이름표
    this.load.image("name_tag", "assets/name_tag.jpg");
    // 말걸기 전 느낌표
    this.load.image("interaction", "assets/interaction.png");

    // 캐릭터 이미지
    this.load.image("player", "assets/char/char_player.png");
    this.load.image("거짓귀", "assets/char/char_거짓귀.png");
    this.load.image("세종의 영혼", "assets/char/char_세종의 영혼.png");
    this.load.image("해태", "assets/char/char_해태.png");
    this.load.image("비겁귀", "assets/char/char_비겁귀.png");
    
    // 배경 이미지
    this.load.image("bg_서십자각터", "assets/bg/bg_서십자각터.jpg");
    this.load.image("bg_서십자각터_dark", "assets/bg/bg_서십자각터_dark.jpeg");
    this.load.image("bg_광화문", "assets/bg/bg_광화문.jpg");
    this.load.image("bg_흥례문", "assets/bg/bg_흥례문.jpg");
    this.load.image("bg_영제교", "assets/bg/bg_영제교.jpg");
    this.load.image("bg_근정문", "assets/bg/bg_근정문.jpg");
    this.load.image("scroll", "assets/scroll.png");

    // 아이콘
    this.load.image("icon_해태", "assets/icons/icon_해태.png");
    this.load.image("icon_짚신", "assets/icons/icon_짚신.png");
  }

  create() {
    // 시작 → 맵으로 이동
    // this.scene.start("MapScene");
    this.scene.start("광화문");
  }
}

