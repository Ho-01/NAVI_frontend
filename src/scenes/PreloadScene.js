import Phaser from "phaser";
import { createInventoryStore } from "../features/inventory/store";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const { width, height } = this.scale;
    // 로딩중 텍스트
    this.로딩중텍스트 = this.add.text(width / 2, height / 2, "로딩 중.. 잠시만 기다려주세요", {
      fontSize: "32px",
      color: "#ffffffff"
    }).setOrigin(0.5);

    // JSON 대사 파일 로드
    this.load.json("dialog_서십자각터_1", "json/dialog_서십자각터_1.json");
    this.load.json("dialog_서십자각터_2", "json/dialog_서십자각터_2.json");
    this.load.json("dialog_광화문_1", "json/dialog_광화문_1.json");
    this.load.json("dialog_광화문_2", "json/dialog_광화문_2.json");
    this.load.json("dialog_광화문_3", "json/dialog_광화문_3.json");
    this.load.json("dialog_광화문_4", "json/dialog_광화문_4.json");
    this.load.json("dialog_흥례문_1", "json/dialog_흥례문_1.json");
    this.load.json("dialog_흥례문_2", "json/dialog_흥례문_2.json");
    this.load.json("dialog_영제교_1", "json/dialog_영제교_1.json");
    this.load.json("dialog_영제교_2", "json/dialog_영제교_2.json");
    this.load.json("dialog_근정문_1", "json/dialog_근정문_1.json");
    this.load.json("dialog_근정문_2", "json/dialog_근정문_2.json");
    this.load.json("dialog_수정전_1", "json/dialog_수정전_1.json");
    this.load.json("dialog_수정전_2", "json/dialog_수정전_2.json");
    this.load.json("dialog_경회루_1", "json/dialog_경회루_1.json");
    this.load.json("dialog_경회루_2", "json/dialog_경회루_2.json");
    this.load.json("dialog_아미산_1", "json/dialog_아미산_1.json");
    this.load.json("dialog_아미산_2", "json/dialog_아미산_2.json");

    // JSON 컷씬 파일 로드
    this.load.json("cutscene1", "json/cutscene1.json");
    this.load.json("cutscene2", "json/cutscene2.json");
    this.load.json("cutscene_광화문명명1", "json/cutscene_광화문명명1.json");
    this.load.json("cutscene_광화문명명2", "json/cutscene_광화문명명2.json");
    this.load.json("cutscene_광화문명명3", "json/cutscene_광화문명명3.json");
    this.load.json("cutscene_광화문명명4", "json/cutscene_광화문명명4.json");
    this.load.json("cutscene_광화문명명5", "json/cutscene_광화문명명5.json");
    this.load.json("cutscene_광화문명명6", "json/cutscene_광화문명명6.json");
    this.load.json("cutscene_광화문명명7", "json/cutscene_광화문명명7.json");
    this.load.json("cutscene_근정문파괴", "json/cutscene_근정문파괴.json");
    // 컷씬 이미지
    this.load.image("cutscene1", "assets/cutscenes/cutscene1.png");
    this.load.image("cutscene2", "assets/cutscenes/cutscene2.png");
    this.load.image("cutscene_광화문명명1", "assets/cutscenes/cutscene_광화문명명1.png");
    this.load.image("cutscene_광화문명명2", "assets/cutscenes/cutscene_광화문명명2.png");
    this.load.image("cutscene_광화문명명3", "assets/cutscenes/cutscene_광화문명명3.png");
    this.load.image("cutscene_광화문명명4", "assets/cutscenes/cutscene_광화문명명4.png");
    this.load.image("cutscene_광화문명명5", "assets/cutscenes/cutscene_광화문명명5.png");
    this.load.image("cutscene_광화문명명6", "assets/cutscenes/cutscene_광화문명명6.png");
    this.load.image("cutscene_광화문명명7", "assets/cutscenes/cutscene_광화문명명7.png");
    this.load.image("cutscene_근정문파괴", "assets/cutscenes/cutscene_근정문파괴.png");

    // JSON 문제 파일 로드
    this.load.json("problem1", "json/problem1.json");
    this.load.json("problem2", "json/problem2.json");
    this.load.json("problem3", "json/problem3.json");
    this.load.json("problem4", "json/problem4.json");
    this.load.json("problem5", "json/problem5.json");
    this.load.json("problem6", "json/problem6.json");
    this.load.json("problem7", "json/problem7.json");
    this.load.json("problem8", "json/problem8.json");
    // JSON 맵 이동 파일 로드
    this.load.json("move_f서십자각터_t광화문", "json/move_f서십자각터_t광화문.json");
    this.load.json("move_f광화문_t흥례문", "json/move_f광화문_t흥례문.json");
    this.load.json("move_f흥례문_t영제교", "json/move_f흥례문_t영제교.json");
    this.load.json("move_f영제교_t근정문", "json/move_f영제교_t근정문.json");
    this.load.json("move_f근정문_t수정전", "json/move_f근정문_t수정전.json");
    this.load.json("move_f수정전_t경회루", "json/move_f수정전_t경회루.json");
    this.load.json("move_f경회루_t아미산", "json/move_f경회루_t아미산.json");
    // JSON 튜토리얼 파일 로드
    this.load.json("tutorial_이동", "json/tutorial_이동.json");
    this.load.json("tutorial_지도", "json/tutorial_지도.json");
    // 튜토리얼 이미지
    this.load.image("tutorial_이동_1", "assets/tutorials/tutorial_이동_1.png");
    this.load.image("tutorial_이동_2", "assets/tutorials/tutorial_이동_2.png");
    this.load.image("tutorial_이동_3", "assets/tutorials/tutorial_이동_3.png");
    this.load.image("tutorial_지도_1", "assets/tutorials/tutorial_지도_1.png");
    this.load.image("tutorial_지도_2", "assets/tutorials/tutorial_지도_2.png");

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
    this.load.image("어둑시니_할아버지", "assets/char/char_어둑시니_할아버지.png");
    this.load.image("세종의 영혼", "assets/char/char_세종의 영혼.png");
    this.load.image("해태", "assets/char/char_해태.png");
    this.load.image("어둑시니_광화문", "assets/char/char_어둑시니_광화문.png");
    this.load.image("어둑시니_근정문", "assets/char/char_어둑시니_근정문.png");
    this.load.image("어둑시니_영제교", "assets/char/char_어둑시니_영제교.png");
    this.load.image("청룡", "assets/char/char_청룡.png");

    // 맵 이름 띄울 빈 두루마리
    this.load.image("맵_타이틀", "assets/맵_타이틀.png");

    // 배경 이미지
    this.load.image("bg_서십자각터", "assets/bg/bg_서십자각터.jpg");
    this.load.image("bg_서십자각터_dark", "assets/bg/bg_서십자각터_dark.jpeg");
    this.load.image("bg_광화문", "assets/bg/bg_광화문.jpg");
    this.load.image("bg_흥례문", "assets/bg/bg_흥례문.jpg");
    this.load.image("bg_영제교", "assets/bg/bg_영제교.jpg");
    this.load.image("bg_근정문", "assets/bg/bg_근정문.jpg");
    this.load.image("bg_근정문_dark", "assets/bg/bg_근정문_dark.png");
    this.load.image("bg_수정전", "assets/bg/bg_수정전.jpg");
    this.load.image("bg_수정전내부", "assets/bg/bg_수정전내부.png");
    this.load.image("bg_경회루", "assets/bg/bg_경회루.jpg");
    this.load.image("bg_아미산", "assets/bg/bg_아미산.jpg");
    this.load.image("bg_강녕전", "assets/bg/bg_강녕전.png");
    this.load.image("bg_교태전", "assets/bg/bg_교태전.png");
    this.load.image("bg_생물방", "assets/bg/bg_생물방.png");
    this.load.image("bg_소주방우물", "assets/bg/bg_소주방우물.png");
    this.load.image("scroll", "assets/scroll.png");

    // 아이콘
    this.load.image("icon_해태", "assets/icons/icon_해태.png");
    this.load.image("icon_짚신", "assets/icons/icon_짚신.png");
    this.load.image("icon_호리병", "assets/icons/icon_호리병.png");
    this.load.image("icon_지도", "assets/icons/icon_지도.png");
    this.load.image("icon_위쪽이동", "assets/icons/icon_위쪽이동.png");
    this.load.image("icon_아래쪽이동", "assets/icons/icon_아래쪽이동.png");
    this.load.image("icon_왼쪽이동", "assets/icons/icon_왼쪽이동.png");
    this.load.image("icon_오른쪽이동", "assets/icons/icon_오른쪽이동.png");
    this.load.image("icon_선택", "assets/icons/icon_선택.png");
    this.load.image("icon_인벤토리", "assets/icons/icon_인벤토리.png");

    // 지도
    this.load.image("map", "assets/map.png");

    // 아이템, 유령 이미지
    this.load.image("item_1", "assets/items/item_1.png");
    this.load.image("item_2", "assets/items/item_2.png");
    this.load.image("item_3", "assets/items/item_3.png");
    this.load.image("item_4", "assets/items/item_4.png");

    this.load.image("ghost_1", "assets/items/ghost_1.png");
    this.load.image("ghost_2", "assets/items/ghost_2.png");
    this.load.image("ghost_3", "assets/items/ghost_3.png");
    this.load.image("ghost_4", "assets/items/ghost_4.png");
  }

  create() {
    // 시작 → 맵으로 이동
    
    const inventoryStore = window.inventoryStore; // 전역 스토어 접근 (만들어둔 store.js 기준)
    
    if (!this.game.registry.get("inventory")) {
      this.game.registry.set("inventory", createInventoryStore());
    }

    // 추가 코드: gourd 스토어도 초기화
    if (!this.game.registry.get("gourd")) {
      this.game.registry.set("gourd", createInventoryStore());
    }
    // this.scene.start("수정전_지도획득후");
    this.scene.start("DialogScene", { json: this.cache.json.get("dialog_서십자각터_1"), returnScene: "서십자각터" });
  }
}

