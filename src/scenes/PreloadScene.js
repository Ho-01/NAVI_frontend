import Phaser from "phaser";
import { createInventoryStore } from "../features/inventory/store";
import RunStorage from "../core/runStorage_GYEONGBOKGUNG";
import InventoryService from "../features/inventory/service.js";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#fffaee");

    // 로딩중 로고
    const logo = this.add.image(width * 0.5, height * 0.1, "logo");
    logo.setDisplaySize(width * 0.3, width * 0.3);
    logo.setOrigin(0.5);
    // 로딩중 텍스트
    this.로딩중텍스트 = this.add.text(width / 2, height / 2, "로딩 중.. 잠시만 기다려주세요", {
      fontFamily: "SkyblessingInje", fontSize: Math.round(height * 0.03),
      color: "#000000ff"
    }).setOrigin(0.5);

    //팝업 띄우기위한 세팅
    if (!this.game.registry.get("rewardQueue"))
      this.game.registry.set("rewardQueue", []);

    // JSON 대사 파일 로드
    this.load.json("dialog_서십자각터_1", "json/dialog_서십자각터_1.json");
    this.load.json("dialog_서십자각터_2", "json/dialog_서십자각터_2.json");
    this.load.json("dialog_광화문_1", "json/dialog_광화문_1.json");
    this.load.json("dialog_광화문_2", "json/dialog_광화문_2.json");
    this.load.json("dialog_광화문_3", "json/dialog_광화문_3.json");
    this.load.json("dialog_광화문_4", "json/dialog_광화문_4.json");
    this.load.json("dialog_광화문_5", "json/dialog_광화문_5.json");
    this.load.json("dialog_광화문_6", "json/dialog_광화문_6.json");
    this.load.json("dialog_광화문_7", "json/dialog_광화문_7.json");
    this.load.json("dialog_흥례문_1", "json/dialog_흥례문_1.json");
    this.load.json("dialog_흥례문_2", "json/dialog_흥례문_2.json");
    this.load.json("dialog_영제교_1", "json/dialog_영제교_1.json");
    this.load.json("dialog_영제교_2", "json/dialog_영제교_2.json");
    this.load.json("dialog_근정문_1", "json/dialog_근정문_1.json");
    this.load.json("dialog_근정문_2", "json/dialog_근정문_2.json");
    this.load.json("dialog_수정전_1", "json/dialog_수정전_1.json");
    this.load.json("dialog_수정전_2", "json/dialog_수정전_2.json");
    this.load.json("dialog_수정전_3", "json/dialog_수정전_3.json");
    this.load.json("dialog_경회루_1", "json/dialog_경회루_1.json");
    this.load.json("dialog_경회루_2", "json/dialog_경회루_2.json");
    this.load.json("dialog_아미산_1", "json/dialog_아미산_1.json");
    this.load.json("dialog_교태전_1", "json/dialog_교태전_1.json");
    this.load.json("dialog_생물방소주방_1", "json/dialog_생물방소주방_1.json");
    this.load.json("dialog_생물방소주방_2", "json/dialog_생물방소주방_2.json");
    this.load.json("dialog_생물방소주방_3", "json/dialog_생물방소주방_3.json");
    this.load.json("dialog_생물방소주방_4", "json/dialog_생물방소주방_4.json");
    this.load.json("dialog_어패모두획득_소주방", "json/dialog_어패모두획득_소주방.json");
    this.load.json("dialog_근정전_1", "json/dialog_근정전_1.json");
    this.load.json("dialog_근정전_2", "json/dialog_근정전_2.json");
    this.load.json("dialog_근정전_3", "json/dialog_근정전_3.json");
    this.load.json("dialog_근정전_4", "json/dialog_근정전_4.json");

    // JSON 컷씬 파일 로드
    this.load.json("cutscene_오프닝1", "json/cutscene_오프닝1.json");
    this.load.json("cutscene_오프닝2", "json/cutscene_오프닝2.json");
    this.load.json("cutscene1", "json/cutscene1.json");
    this.load.json("cutscene2", "json/cutscene2.json");
    this.load.json("cutscene_광화문명명1", "json/cutscene_광화문명명1.json");
    this.load.json("cutscene_광화문명명2", "json/cutscene_광화문명명2.json");
    this.load.json("cutscene_광화문명명3", "json/cutscene_광화문명명3.json");
    this.load.json("cutscene_광화문명명4", "json/cutscene_광화문명명4.json");
    this.load.json("cutscene_광화문명명5", "json/cutscene_광화문명명5.json");
    this.load.json("cutscene_광화문명명6", "json/cutscene_광화문명명6.json");
    this.load.json("cutscene_광화문명명7", "json/cutscene_광화문명명7.json");
    this.load.json("cutscene_광화문명명8", "json/cutscene_광화문명명8.json");
    this.load.json("cutscene_광화문명명9", "json/cutscene_광화문명명9.json");
    this.load.json("cutscene_광화문명명10", "json/cutscene_광화문명명10.json");
    this.load.json("cutscene_광화문으로향하는어둑시니", "json/cutscene_광화문으로향하는어둑시니.json");
    this.load.json("cutscene_근정문파괴", "json/cutscene_근정문파괴.json");
    this.load.json("cutscene_어질러진수정전", "json/cutscene_어질러진수정전.json");
    this.load.json("cutscene_청룡등장", "json/cutscene_청룡등장.json");
    this.load.json("cutscene_궁녀들", "json/cutscene_궁녀들.json");
    this.load.json("cutscene_어둑시니등장", "json/cutscene_어둑시니등장.json");
    this.load.json("cutscene_불타는근정전", "json/cutscene_불타는근정전.json");
    this.load.json("cutscene_사방신등장1", "json/cutscene_사방신등장1.json");
    this.load.json("cutscene_사방신등장2", "json/cutscene_사방신등장2.json");
    this.load.json("cutscene_사방신등장3", "json/cutscene_사방신등장3.json");
    this.load.json("cutscene_재봉인1", "json/cutscene_재봉인1.json");
    this.load.json("cutscene_재봉인2", "json/cutscene_재봉인2.json");
    this.load.json("cutscene_엔딩1", "json/cutscene_엔딩1.json");
    this.load.json("cutscene_엔딩2", "json/cutscene_엔딩2.json");
    // 컷씬 이미지
    this.load.image("cutscene_오프닝1", "assets/cutscenes/cutscene_오프닝1.png");
    this.load.image("cutscene_오프닝2", "assets/cutscenes/cutscene_오프닝2.png");
    this.load.image("cutscene1", "assets/cutscenes/cutscene1.png");
    this.load.image("cutscene2", "assets/cutscenes/cutscene2.png");
    this.load.image("cutscene_광화문명명1", "assets/cutscenes/cutscene_광화문명명1.png");
    this.load.image("cutscene_광화문명명2", "assets/cutscenes/cutscene_광화문명명2.png");
    this.load.image("cutscene_광화문명명3", "assets/cutscenes/cutscene_광화문명명3.png");
    this.load.image("cutscene_광화문명명4", "assets/cutscenes/cutscene_광화문명명4.png");
    this.load.image("cutscene_광화문명명5", "assets/cutscenes/cutscene_광화문명명5.png");
    this.load.image("cutscene_광화문명명6", "assets/cutscenes/cutscene_광화문명명6.png");
    this.load.image("cutscene_광화문명명7", "assets/cutscenes/cutscene_광화문명명7.png");
    this.load.image("cutscene_광화문명명8", "assets/cutscenes/cutscene_광화문명명8.png");
    this.load.image("cutscene_광화문명명9", "assets/cutscenes/cutscene_광화문명명9.png");
    this.load.image("cutscene_광화문명명10", "assets/cutscenes/cutscene_광화문명명10.png");
    this.load.image("cutscene_광화문으로향하는어둑시니", "assets/cutscenes/cutscene_광화문으로향하는어둑시니.png");
    this.load.image("cutscene_근정문파괴", "assets/cutscenes/cutscene_근정문파괴.png");
    this.load.image("cutscene_어질러진수정전", "assets/bg/bg_수정전내부.png");
    this.load.image("cutscene_청룡등장", "assets/cutscenes/cutscene_청룡등장.png");
    this.load.image("cutscene_궁녀들", "assets/cutscenes/cutscene_궁녀들.png");
    this.load.image("cutscene_어둑시니등장", "assets/cutscenes/cutscene_어둑시니등장.png");
    this.load.image("cutscene_불타는근정전", "assets/cutscenes/cutscene_불타는근정전.png");
    this.load.image("cutscene_사방신등장1", "assets/cutscenes/cutscene_사방신등장1.png");
    this.load.image("cutscene_사방신등장2", "assets/cutscenes/cutscene_사방신등장2.png");
    this.load.image("cutscene_사방신등장3", "assets/cutscenes/cutscene_사방신등장3.png");
    this.load.image("cutscene_재봉인1", "assets/cutscenes/cutscene_재봉인1.png");
    this.load.image("cutscene_재봉인2", "assets/cutscenes/cutscene_재봉인2.png");
    this.load.image("cutscene_엔딩1", "assets/cutscenes/cutscene_엔딩1.png");
    this.load.image("cutscene_엔딩2", "assets/cutscenes/cutscene_엔딩2.png");

    // JSON 문제 파일 로드
    this.load.json("problem1", "json/problem1.json");
    this.load.json("problem2", "json/problem2.json");
    this.load.json("problem3", "json/problem3.json");
    this.load.json("problem4", "json/problem4.json");
    this.load.json("problem5", "json/problem5.json");
    this.load.json("problem6", "json/problem6.json");
    this.load.json("problem7", "json/problem7.json");
    this.load.json("problem8", "json/problem8.json");
    this.load.json("problem9", "json/problem9.json");
    this.load.json("problem10", "json/problem10.json");

    // JSON 맵 이동 파일 로드
    this.load.json("move_f서십자각터_t광화문", "json/move_f서십자각터_t광화문.json");
    this.load.json("move_f광화문_t흥례문", "json/move_f광화문_t흥례문.json");
    this.load.json("move_f흥례문_t영제교", "json/move_f흥례문_t영제교.json");
    this.load.json("move_f영제교_t근정문", "json/move_f영제교_t근정문.json");
    this.load.json("move_f근정문_t수정전", "json/move_f근정문_t수정전.json");
    this.load.json("move_f수정전_t경회루", "json/move_f수정전_t경회루.json");
    this.load.json("move_f경회루_t아미산", "json/move_f경회루_t아미산.json");
    this.load.json("move_f아미산_t생물방소주방", "json/move_f아미산_t생물방소주방.json");
    this.load.json("move_f소주방_t근정전", "json/move_f소주방_t근정전.json");
    this.load.json("move_f근정전_t광화문", "json/move_f근정전_t광화문.json");

    // JSON 튜토리얼 파일 로드
    this.load.json("tutorial_어패함", "json/tutorial_어패함.json");
    // 튜토리얼 이미지
    this.load.image("tutorial_어패함_1", "assets/tutorials/tutorial_어패함_1.png");

    this.load.image("move", "assets/maps/move.png");
    // 빈 말풍선 이미지
    this.load.image("speech_left", "assets/speech_left.png");
    this.load.image("speech_right", "assets/speech_right.png");
    // 빈 이름표
    this.load.image("name_tag", "assets/name_tag.jpg");
    // 말걸기 전 느낌표
    this.load.image("interaction", "assets/interaction.png");
    // 나비아이콘 full
    // this.load.image("navi_full", "assets/navi_full.png");

    // 캐릭터 이미지
    this.load.image("player", "assets/char/char_player.png");
    this.load.image("어둑시니_할아버지", "assets/char/char_어둑시니_할아버지.png");
    this.load.image("세종의 영혼", "assets/char/char_세종의 영혼.png");
    this.load.image("해태", "assets/char/char_해태.png");
    this.load.image("수문장", "assets/char/char_수문장.png");
    this.load.image("어둑시니_영제교", "assets/char/char_어둑시니_영제교.png");
    this.load.image("어둑시니_근정문", "assets/char/char_어둑시니_근정문.png");
    this.load.image("학사", "assets/char/char_학사.png");
    this.load.image("청룡", "assets/char/char_청룡.png");
    this.load.image("궁녀", "assets/char/char_궁녀.png");
    this.load.image("어둑시니", "assets/char/char_어둑시니.png");
    this.load.image("blank", "assets/char/char_blank.png");

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
    this.load.image("bg_소주방", "assets/bg/bg_소주방.png");
    this.load.image("bg_근정전_dark", "assets/bg/bg_근정전_dark.png");
    this.load.image("bg_근정전_fire", "assets/bg/bg_근정전_fire.png");
    this.load.image("bg_근정전", "assets/bg/bg_근정전.png");
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
    this.load.image("map", "assets/maps/map.png");

    // 아이템, 유령 이미지
    this.load.image("item_백호", "assets/items/item_백호.png");
    this.load.image("item_주작", "assets/items/item_주작.png");
    this.load.image("item_청룡", "assets/items/item_청룡.png");
    this.load.image("item_현무", "assets/items/item_현무.png");

    this.load.image("ghost_1", "assets/items/ghost_1.png");
    this.load.image("ghost_2", "assets/items/ghost_2.png");
    this.load.image("ghost_3", "assets/items/ghost_3.png");
    this.load.image("ghost_4", "assets/items/ghost_4.png");
    this.load.image("ghost_잡귀", "assets/char/char_잡귀.png");
    this.load.image("ghost_아귀", "assets/char/char_아귀.png");
    //오버레이 이미지
    this.load.image("overlay_inventory", "assets/overlay/overlay_inventory.png");
    this.load.image("overlay_bundle", "assets/overlay/overlay_bundle.png");
  }


  async create() {
    // 서버 인벤토리 → 클라 스토어 동기화 (runId 우선, in_progress 폴백)
     if (!this.game.registry.get("inventory")) {
      this.game.registry.set("inventory", createInventoryStore());
    }

    // 추가 코드: gourd 스토어도 초기화
    if (!this.game.registry.get("gourd")) {
      this.game.registry.set("gourd", createInventoryStore());
    }
    await InventoryService.hydrate(this,{replace: true });
    const inventoryStore = window.inventoryStore; // 전역 스토어 접근 (만들어둔 store.js 기준)

    const r = await InventoryService.hydrate(this);
    console.log("[hydrate]", r);
    const store = this.game.registry.get("inventory");
    console.log("[store items]", store?.items?.(), "counts:", store && store.items().map(k => [k, store.getCount(k)]));

   

    // this.scene.start("서십자각터");
    // opening, problem1~13, cleared
    const checkpoint = RunStorage.getCheckpoint();
    if (checkpoint == "opening") {
      console.log("[PreloadScene] 새 게임 시작");
      this.scene.start("UsernameInputScene");
    }
    else if (checkpoint == "ending") {
      console.log("[PreloadScene] 새 게임 시작");
      this.scene.start("UsernameInputScene");
    }
    else if (checkpoint == "problem1") {
      this.scene.start("CutScene", { json: this.cache.json.get("cutscene1") })
    }
    else if (checkpoint == "problem2") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_광화문_5") })
    }
    else if (checkpoint == "problem3") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_흥례문_2") })
    }
    else if (checkpoint == "problem4") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_영제교_2") })
    }
    else if (checkpoint == "problem5") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_수정전_3") })
    }
    else if (checkpoint == "problem6") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_경회루_2") })
    }
    else if (checkpoint == "problem7") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_아미산_1") })
    }
    else if (checkpoint == "problem8") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_생물방소주방_3") })
    }
    else if (checkpoint == "problem9") {
      this.scene.start("CutScene", { json: this.cache.json.get("cutscene_어둑시니등장") })
    }
    else if (checkpoint == "problem10") {
      this.scene.start("DialogScene", { json: this.cache.json.get("dialog_근정전_3") })
    }
    else {
      console.log("[PreloadScene] 이어하기 실패, checkpoint : ", RunStorage.getCheckpoint());
      this.scene.start("TitleScene");
    }
  }
}