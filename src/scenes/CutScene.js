// CutScene.js
import Phaser from "phaser";
import autoGrant from "/src/features/inventory/autoGrant.js";
import TouchEffect from "../ui/TouchEffect";
import RunService from "../features/run/service";
import RunStorage from "../core/runStorage_GYEONGBOKGUNG";

export default class CutScene extends Phaser.Scene {
  constructor() {
    super({ key: "CutScene" });
  }

  init(data) {
    const json = data.json;
    if (!json) {
        console.error("json undefined!", data);
        return;
    }
    this.returnScene = data.returnScene;
    this.effect = json.effect;
    this.rewardItem = json.rewardItem || null; // 보상 아이템 (없을 수도 있음)
    if(json.imageKey){
      this.imageKey = json.imageKey;
    } else{this.imageKey=null;}
    if (json.nextScene) {
      this.nextScene = json.nextScene;
    }else{this.nextScene=null;}
    if(json.nextParam){
      this.nextParam = json.nextParam;
    }else{this.nextParam=null;}
    if(json.checkpoint){
      this.checkpoint = json.checkpoint;
    }else{this.checkpoint=null;}
  }

  preload(){
    if (!this.textures.exists(this.imageKey)) {
      this.load.image(this.imageKey, `assets/cutscenes/${this.imageKey}.png`);
    }
  }

  create() {
    console.log("다음 : "+this.nextScene, this.nextParam+" return : "+this.returnScene);
    const { width: W, height: H } = this.scale;

    TouchEffect.init(this); // 터치 이펙트

    this.cameras.main.setBackgroundColor("#000000");

    // 체크포인트 저장
    if(this.checkpoint!= null){
      if(this.checkpoint=="cleared"){
        RunService.gameClear(RunStorage.getRunId());
      }else{
        RunService.updateCheckpoint(RunStorage.getRunId(), this.checkpoint);
      }
    }

    const img = this.add.image(W * 0.5, H * 0.5, this.imageKey).setOrigin(0.5);
    // 비율 유지 스케일링
    const tex = this.textures.get(this.imageKey).getSourceImage();
    const sx = W / tex.width, sy = H / tex.height;
    const s = Math.min(sx, sy); // 전체 화면 안쪽에 꽉 차게
    img.setScale(s);

    // === 2) 이펙트 실행 ===
    this.runEffect(this.effect);

    // === 3) 터치/클릭 시 다음 씬으로 이동 ===
    this.input.once("pointerdown", () => {
      if (this.rewardItem) {
        this.rewardItem.split(",").map(s => s.trim()).forEach(item => {
          console.log("[ProblemScene] 보상 아이템 지급:", item);
          autoGrant(this, item);
        });
        // autoGrant(this, this.rewardItem, { onceId: `problem:${this.nextParam || this.title}` });
      }
      this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
    });
  }

  // --- 이펙트 스위처 ---
  runEffect(effectName) {
    if(effectName==="진동"){
        this.cameras.main.shake(180, 0.004);
    } else if(effectName==="섬광"){
        this.cameras.main.flash(150);
    } else if(effectName==="천둥"){
        this.cameras.main.flash(150, 230, 240, 255);
        this.cameras.main.shake(180, 0.004);
    }
  }
}
