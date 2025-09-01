// CutScene.js
import Phaser from "phaser";

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
    this.imageKey = json.imageKey;
    this.nextScene = json.nextScene;
    this.nextParam = json.nextParam;
  }

  create() {
    console.log("다음 : "+this.nextScene, this.nextParam);
    const { width: W, height: H } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    const img = this.add.image(W * 0.5, H * 0.5, this.imageKey).setOrigin(0.5);
    // 비율 유지 스케일링
    const tex = this.textures.get(this.imageKey).getSourceImage();
    const sx = W / tex.width, sy = H / tex.height;
    const s = Math.min(sx, sy); // 전체 화면 안쪽에 꽉 차게
    img.setScale(s);

    // === 2) 이펙트 실행 ===
    this.runEffect(this.effect);

    // === 3) 터치/클릭 시 다음 씬으로 이동 ===
    this.input.once("pointerdown", () => 
        this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene })
    );
  }

  // --- 이펙트 스위처 ---
  runEffect(effectName) {
    if(effectName==="진동"){
        this.cameras.main.shake(180, 0.0025);
    } else if(effectName==="섬광"){
        this.cameras.main.flash(120);
    } else if(effectName==="천둥"){
        this.cameras.main.flash(120, 230, 240, 255);
        this.cameras.main.shake(150, 0.0025);
    }
  }
}
