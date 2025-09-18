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
    const centerY = height*0.3;
    const maxW = width*0.9;
    const padding = width*0.03;
    const questionBubble = this.add.container(width*0.5, centerY).setPosition(width/2, centerY);
    const questionBubble_text = this.add.text(questionBubble.width/2, questionBubble.height/2, this.question, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.05,color: "#111",align: "center", wordWrap:{width:maxW-padding*2}}).setOrigin(0.5);
    const bubbleW = questionBubble_text.width + padding*2;
    const bubbleH = questionBubble_text.height + padding*2;
    const questionBubbleRound = this.add.graphics()
    .fillStyle(0xfffaeb, 1).fillRoundedRect(-bubbleW/2, -bubbleH/2, bubbleW, bubbleH, width*0.02)
    .lineStyle(2,0xe9dfc7,1).strokeRoundedRect(-bubbleW/2, -bubbleH/2, bubbleW, bubbleH, width*0.02);
    questionBubble.add(questionBubbleRound); questionBubble.add(questionBubble_text); 
    questionBubble_text.setPosition(0,0);

    // 하단부 배경
    const bottomBg = this.add.rectangle(width*0.5, height*0.75, width, height/2, 0x2e3a46).setOrigin(0.5, 0.5);

    // 하단 문제이미지
    const questionImgContainer = this.add.container(width*0.5, height*0.625).setPosition(width*0.5, height*0.625);
    const questionImgRound = this.add.graphics()
    .fillStyle(0xfffaeb, 1).fillRoundedRect(-width*0.475, -height*0.11, width*0.95, height*0.22, width*0.02)
    .lineStyle(2,0xe9dfc7,1).strokeRoundedRect(-width*0.475, -height*0.11, width*0.95, height*0.22, width*0.02);
    questionImgContainer.add(questionImgRound);

    const questionImg = this.add.image(0, 0, this.mainImg.key).setOrigin(0.5, 0.5);
    questionImg.displayWidth = width*0.95;
    questionImg.displayHeight = height*0.22;
    questionImgContainer.add(questionImg);

    const maskGfx = this.add.graphics().setVisible(false).fillStyle(0xffffff, 1).fillRoundedRect(-width*0.475, -height*0.11, width*0.95, height*0.22, width*0.02);
    questionImgContainer.add(maskGfx);

    const mask = maskGfx.createGeometryMask();
    questionImg.setMask(mask);

    // 하단 선택지
    const choiceH = height*0.8;
    const choiceW = width*0.9;
    const choiceSize = width*0.2;
    const left = (width-choiceW)/2;
    const c1_bg = this.add.image(left+choiceW*0.125, choiceH, this.choices[0].sideImgKey).setOrigin(0.5).setDisplaySize(choiceSize, choiceSize);
    const c1_text = this.add.text(left+choiceW*0.125, choiceH, this.choices[0].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);
    const c2_bg = this.add.image(left+choiceW*0.375, choiceH, this.choices[1].sideImgKey).setOrigin(0.5).setDisplaySize(choiceSize, choiceSize);
    const c2_text = this.add.text(left+choiceW*0.375, choiceH, this.choices[1].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);
    const c3_bg = this.add.image(left+choiceW*0.625, choiceH, this.choices[2].sideImgKey).setOrigin(0.5).setDisplaySize(choiceSize, choiceSize);
    const c3_text = this.add.text(left+choiceW*0.625, choiceH, this.choices[2].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);
    const c4_bg = this.add.image(left+choiceW*0.875, choiceH, this.choices[3].sideImgKey).setOrigin(0.5).setDisplaySize(choiceSize, choiceSize);
    const c4_text = this.add.text(left+choiceW*0.875, choiceH, this.choices[3].text, {fontFamily: "Pretendard", fontStyle: "bold", fontSize: width * 0.04,color: "#111",align: "center"}).setOrigin(0.5);

    // 하단 버튼 footer
    const footer = this.add.container(width*0.5, height-height*0.125/2);
    const footer_bg = this.add.image(footer.width, footer.height, "modal_plain").setOrigin(0.5).setDepth(1);
    footer_bg.displayWidth = width;
    footer_bg.displayHeight = height*0.125;
    footer.add(footer_bg);

    const 도움 = this.add.image(-footer_bg.width*0.5, 0, "btn_secondary").setOrigin(0.5);
    footer.add(도움);

    const 결정 = this.add.image(footer_bg.width*0.5, 0, "btn_primary").setOrigin(0.5);
    footer.add(결정);
  }
}
