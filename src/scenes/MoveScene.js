import Phaser from "phaser";

export default class MoveScene extends Phaser.Scene {
  constructor() {
    super("MoveScene");
  }

  init(data) {
    const json = data.json;
    if (!json) {
        console.error("json undefined!", data);
        return;
    }
    this.returnScene = data.returnScene;
    this.text = json.text;
    this.moveCancel = json.moveCancel;
    this.tips = json.tips;
    if(json.imageKey){
      this.imageKey = json.imageKey;
    } else{this.imageKey=null;}
    if (json.nextScene) {
      this.nextScene = json.nextScene;
    }else{this.nextScene=null;}
    if(json.nextParam){
      this.nextParam = json.nextParam;
    }else{this.nextParam=null;}
  }

  create() {
    console.log("다음 : "+this.nextScene, this.nextParam+" return : "+this.returnScene);
    const { width: W, height: H } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    this.bg = this.add.image(W*0.5, H*0.5, "scroll").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(W / this.bg.width, H / this.bg.height));

    const img = this.add.image(W * 0.5, H * 0.35, this.imageKey).setOrigin(0.5).setPosition(W*0.5, H*0.3);
    // 비율 유지 스케일링
    const tex = this.textures.get(this.imageKey).getSourceImage();
    const sx = W / tex.width*0.6, sy = H / tex.height*0.35;
    const s = Math.min(sx, sy); // 전체 화면 안쪽에 꽉 차게
    img.setScale(s);

    // ooo으로 이동해주세요...
    this.add.text(W*0.5, H*0.55, this.text, {
          fontSize: W*0.05, color: "#000", wordWrap: { width: W * 0.8 }, align: "center"
        }).setOrigin(0.5).setVisible(true);
    
    const 도착했어요 = this.add.text(W*0.5, H*0.65, "도착했어요!", {fontSize: W*0.05, backgroundColor: "#87b4e8",color: "#000",padding: { x: 80, y: 50 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
        if(this.nextScene){
          this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
        }else{
          this.scene.start(this.returnScene);
        }
    });
    const 이동취소 = this.add.text(W*0.5, H*0.75, "이동 취소", {fontSize: W*0.05, backgroundColor: "#e88798",color: "#000",padding: { x: 80, y: 50 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0)
    .on("pointerdown", () => {
        console.log(this.moveCancel);
        this.scene.start(this.moveCancel);
    });
    if(this.moveCancel!=false){
        이동취소.setAlpha(1);
    }

    this.add.text(W*0.5, H*0.85, this.tips, {
          fontSize: W*0.03, color: "#000", wordWrap: { width: W * 0.7 }, align: "center"
        }).setOrigin(0.5).setVisible(true);
    
    this.cameras.main.fadeIn(50, 0, 0, 0);
  }
}
