import Phaser from "phaser";

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: "TutorialScene" });
  }

  init(data) {
    const json = data.json;
    if (!json) {
        console.error("json undefined!", data);
        return;
    }
    this.script = json.script;
    this.returnScene = data.returnScene;
    if (json.char) {
      this.char = json.char;
    }else{this.char=null;}
    if (json.nextScene) {
      this.nextScene = json.nextScene;
    }else{this.nextScene=null;}
    if(json.nextParam){
      this.nextParam = json.nextParam;
    }else{this.nextParam=null;}
  }

  create() {
    console.log("다음 : "+this.nextScene, this.nextParam+" return : "+this.returnScene);
    const { width, height } = this.scale;
    this.W = width; this.H = height;

    this.cameras.main.setBackgroundColor("#f0e8cf");
    this.bg = this.add.image(width/2, height/2, "__WHITE").setAlpha(0); // 초기 placeholder

    // 해태
    // 화면의 40% x 40% 박스에 맞춰 비율 유지
    const maxW = width  * 0.4;
    const maxH = height * 0.4;

    this.해태  = this.add.image(width * 0.25, height * 0.75, "해태")
    .setOrigin(0.5)
    .setAlpha(0);
    // 생성된 이미지의 원본 크기 기준으로 fit 스케일 계산
    this.해태.setScale(Math.min(maxW / this.해태.width,  maxH / this.해태.height));

    this.세종의영혼  = this.add.image(width * 0.25, height * 0.75, "세종의 영혼")
    .setOrigin(0.5)
    .setAlpha(0);
    // 생성된 이미지의 원본 크기 기준으로 fit 스케일 계산
    this.세종의영혼.setScale(Math.min(maxW / this.세종의영혼.width,  maxH / this.세종의영혼.height));

    this.characters = {해태: this.해태, 세종의영혼: this.세종의영혼};

    // 말풍선+텍스트+이름 묶음
    this.bubbles = {
      left: {
        box: this.add.image(width * 0.5, height * 0.9, "speech_left").setDisplaySize(width*0.9, height*0.15).setVisible(false),
        name: this.add.text(width * 0.10, height * 0.88, "", {
          fontSize: width*0.03, fontStyle: "bold", color: "#000", align: "left"
        }).setOrigin(0, 0).setVisible(false),
        text: this.add.text(width * 0.15, height * 0.9, "", {
          fontSize: width*0.04, color: "#000", wordWrap: { width: width * 0.8 }, align: "left"
        }).setOrigin(0, 0).setVisible(false)
      }
    };

    this.index = 0;
    // 첫 줄 보여주기
    this.showLine(this.script[this.index]);

    // 클릭 시 다음 대사
    this.input.on("pointerdown", () => {
      if (this.isTyping) {
        // 타이핑 중 클릭 → 전체 문장 즉시 출력
        this.finishTyping();
        return;
      }
      this.index++;
      if (this.index < this.script.length) {
        this.showLine(this.script[this.index]);
       } else {
        if(this.nextScene){
          this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
        }else{
          this.scene.start(this.returnScene);
        }
      }
    });
    
    this.cameras.main.fadeIn(50, 0, 0, 0);
  }

  showLine(line) {
    // 초기화
    if(this.char==="해태"){
        this.해태.setAlpha(1); this.세종의영혼.setAlpha(0);
    } else if(this.char==="세종의 영혼"){
        this.해태.setAlpha(0); this.세종의영혼.setAlpha(1);
    }
    Object.values(this.bubbles).forEach(b => {
      b.box.setVisible(true);
      b.text.setVisible(true);
      b.name.setVisible(true);
    });

    // 현재 줄
    const bubble = this.bubbles[line.pos];
    const char = this.characters[line.name==="해태"?"해태":"세종의영혼"];
    if (!bubble || !char) return;

    this.bg.setTexture(line.image).setAlpha(1).setPosition(this.W / 2, this.H * 0.4);
    const s = Math.min(this.W / this.bg.width, this.H / this.bg.height);
    this.bg.setScale(s);

    char.setAlpha(1); // 화자 강조
    bubble.box.setVisible(true);
    bubble.name.setText(line.name.replace("{player}", this.playerName)).setVisible(true);

    // 타이핑 효과
    const fullText = line.text.replace("{player}", this.playerName);
    bubble.text.setText("").setVisible(true);

    this.isTyping = true;
    this.currentBubble = bubble;
    this.currentFullText = fullText;

    this.typingEvent = this.time.addEvent({
      delay: 8, // 한 글자 출력 간격(ms)
      repeat: fullText.length - 1,
      callback: () => {
        const len = bubble.text.text.length;
        bubble.text.setText(fullText.substring(0, len + 1));
        if (len + 1 === fullText.length) {
          this.isTyping = false;
        }
      }
    });
  }

  finishTyping() {
    if (!this.currentBubble) return;
    this.currentBubble.text.setText(this.currentFullText);
    this.isTyping = false;
    this.typingEvent?.remove(false);
  }
}
