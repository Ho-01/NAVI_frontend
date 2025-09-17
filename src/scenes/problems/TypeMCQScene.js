import Phaser from "phaser";

export default class TypeMCQScene extends Phaser.Scene {
  constructor() {
    super({ key: "TypeMCQScene" });
  }

  init(data) {
    const json = data.json;
    if (!json) {
      console.error("json undefined!", data);
      return;
    }
    this.num = json.num;
    this.title = json.title;
    this.background = json.background;
    this.question = json.question;
    this.mainImg = json.mainImg;
    this.choices = json.choices;
    this.answer = json.answer;
    this.info = json.info;
    this.info_wrong = json.info_wrong;
    if (json.nextScene) { this.nextScene = json.nextScene;
    }else{this.nextScene=null;}
    if(json.nextParam){ this.nextParam = json.nextParam;
    }else{this.nextParam=null;}
  }

  preload(){
    const mKey = this.mainImg.key;
    const mPath = this.mainImg.path;
    this.load.image(mKey, mPath);
    for(const ch of this.choices){
        const key = ch.sideImgKey;
        const path = ch.sideImgPath;
        this.load.image(key, path);
    }
    this.load.image("frame_plain", "assets/ui/frame_plain.png");
  }

  create() {
    console.log("다음 : " + this.nextScene, this.nextParam + " return : " + this.returnScene);
    const { width, height } = this.scale;

    const bg = this.add.image(width/2, height/2, mKey).setScale(Math.max(width / bg.width, height / bg.height));

    const header_bg = scene.add.rexNinePatch(width*0.5, height*0.1, width, height*0.2, "frame_plain", undefined, NINE.inset).setOrigin(0.5).setDepth(1);
    const header_label = scene.add.text(width*0.5, height*0.1, this.title, {fontFamily: "Pretendard",fontSize: width * 0.04,color: "#111",align: "center",}).setOrigin(0.5).setDepth(2);
  }
}
