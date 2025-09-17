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
    this.load.image("modal_plain", "assets/ui/modal_plain.png");
    this.load.image("scroll_plain", "assets/ui/scroll_plain.png");
    this.load.image("btn_primary", "assets/ui/btn_primary.png");
    this.load.image("btn_secondary", "assets/ui/btn_secondary.png");
  }

  create() {
    console.log("다음 : " + this.nextScene, this.nextParam + " return : " + this.returnScene);
    const { width, height } = this.scale;

    // 배경
    const bg = this.add.image(width/2, height/2, this.background);
    bg.setScale(Math.max(width / bg.width, height / bg.height));

    // 헤더
    const header = this.add.container(width*0.5, height*0.05);
    const header_bg = this.add.image(header.width/2, header.height/2, "modal_plain").setOrigin(0.5).setDepth(1);
    header_bg.displayWidth = width;
    header_bg.displayHeight = height*0.1;
    const header_label = this.add.text(header.width/2, header.height/2, this.title, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.06,color: "#111",align: "center"}).setOrigin(0.5).setDepth(2);
    header.add(header_bg); header.add(header_label);

    // 중앙 문제출제부
    const questionBubble = this.add.container(width*0.5, height*0.25);
    const questionBubble_bg = this.add.image(questionBubble.width/2, questionBubble.height/2, "modal_plain").setOrigin(0.5).setDepth(1);
    questionBubble_bg.displayWidth = width*0.9;
    questionBubble_bg.displayHeight = height*0.2;
    const questionBubble_text = this.add.text(questionBubble.width/2, questionBubble.height/2, this.question, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5).setDepth(2);
    questionBubble.add(questionBubble_bg); questionBubble.add(questionBubble_text);

    // 하단부 배경
    const bottomBg = this.add.image(width*0.5, height*0.5, "scroll_plain").setOrigin(0.5, 0);
    bottomBg.displayWidth = width;
    bottomBg.displayHeight = height/2;

    // 하단 문제이미지
    const questionImg = this.add.image(width*0.5, height*0.55, this.mainImg.key).setOrigin(0.5, 0);
    questionImg.displayWidth = width*0.7;
    questionImg.displayHeight = height*0.2;

    // 하단 선택지
    const c1_bg = this.add.image(width*0.2, height*0.825, this.choices[0].sideImgKey).setOrigin(0.5);
    const c1_text = this.add.text(width*0.2, height*0.825, this.choices[0].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);
    const c2_bg = this.add.image(width*0.4, height*0.825, this.choices[1].sideImgKey).setOrigin(0.5);
    const c2_text = this.add.text(width*0.4, height*0.825, this.choices[1].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);
    const c3_bg = this.add.image(width*0.6, height*0.825, this.choices[2].sideImgKey).setOrigin(0.5);
    const c3_text = this.add.text(width*0.6, height*0.825, this.choices[2].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);
    const c4_bg = this.add.image(width*0.8, height*0.825, this.choices[3].sideImgKey).setOrigin(0.5);
    const c4_text = this.add.text(width*0.8, height*0.825, this.choices[3].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);

    // 하단 버튼 footer
    const footer = this.add.container(width*0.5, height*0.95);
    const footer_bg = this.add.image(footer.width/2, footer.height/2, "modal_plain").setOrigin(0.5).setDepth(1);
    footer_bg.displayWidth = width;
    footer_bg.displayHeight = height*0.1;
    footer.add(footer_bg);
  }
}
