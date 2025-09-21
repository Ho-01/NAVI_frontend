import Phaser from "phaser";
import autoGrant from "../features/inventory/autoGrant";
import TouchEffect from "../ui/TouchEffect";
import RunService from "../features/run/service";
import RunStorage from "../core/runStorage_GYEONGBOKGUNG";
import UserStorage from "../core/userStorage";

export default class DialogScene extends Phaser.Scene {
  constructor() {
    super({ key: "DialogScene" });
  }

  init(data) {
    const json = data.json;
    if (!json) {
        console.error("json undefined!", data);
        return;
    }
    this.background = json.background;
    this.leftChar = json.leftChar;
    this.rightChar = json.rightChar;
    this.script = json.script;
    this.returnScene = data.returnScene;
    this.playerName = UserStorage.getName(); // {player} 치환용
    this.rewardItem = json.rewardItem || null; // 보상 아이템 (없을 수도 있음)
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
    if (this.background && !this.textures.exists(this.background)) {
      this.load.image(this.background, `assets/bg/${this.background}.png`);
    }
    if (!this.textures.exists("맵_타이틀")) {
      this.load.image("맵_타이틀", "assets/맵_타이틀.png");
    }
    if (this.leftChar && !this.textures.exists(this.leftChar)) {
      this.load.image(this.leftChar, `assets/char/char_${this.leftChar}.png`);
    }
    if (this.rightChar && !this.textures.exists(this.rightChar)) {
      this.load.image(this.rightChar, `assets/char/char_${this.rightChar}.png`);
    }
    if(!this.textures.exists("speech_left")){
      this.load.image("speech_left", "assets/speech_left.png");
    }
    if(!this.textures.exists("speech_right")){
      this.load.image("speech_right", "assets/speech_right.png");
    }
  }

  create() {
    console.log("다음 : "+this.nextScene, this.nextParam+" return : "+this.returnScene);
    const { width, height } = this.scale;

    TouchEffect.init(this); // 터치 이펙트
    
    // 체크포인트 저장
    if(this.checkpoint!= null){
      RunService.updateCheckpoint(RunStorage.getRunId(), this.checkpoint);
    }

    this.index = 0;
    this.bg = this.add.image(width*0.5, height*0.5, this.background)
    .setOrigin(0.5)
    .setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    const scaleX = width / this.bg.width;
    const scaleY = height / this.bg.height;
    const scale = Math.min(scaleX, scaleY);
    this.bg.setScale(scale);

    // 맵 타이틀
    const mapTitle = this.add.image(width * 0.3, height * 0.06, "맵_타이틀").setOrigin(0.5).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: mapTitle, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });
    const mapTitleText = this.add.text(width * 0.3, height * 0.055, this.background.split("_")[1], { fontFamily: "Pretendard", fontSize: width * 0.04, fontStyle: "bold", color: "#333" }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: mapTitleText, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });

    // 좌/우 캐릭터
    // 화면의 40% x 40% 박스에 맞춰 비율 유지
    const maxW = width  * 0.4;
    const maxH = height * 0.4;

    const left  = this.add.image(width * 0.25, height * 0.75, this.leftChar)
    .setOrigin(0.5)
    .setAlpha(0.5);
    const right = this.add.image(width * 0.75, height * 0.75, this.rightChar)
    .setOrigin(0.5)
    .setAlpha(0.5);
    // 생성된 이미지의 원본 크기 기준으로 fit 스케일 계산
    left.setScale(Math.min(maxW / left.width,  maxH / left.height));
    right.setScale(Math.min(maxW / right.width, maxH / right.height));
    this.characters={left,right}

    // 말풍선+텍스트+이름 묶음
    this.bubbles = {
      left: {
        box: this.add.image(width * 0.5, height * 0.9, "speech_left").setDisplaySize(width*0.95, height*0.15).setVisible(false),
        name: this.add.text(width * 0.10, height * 0.88, "", {
          fontFamily: "Pretendard", fontSize: width*0.03, fontStyle: "bold", color: "#000", align: "left"
        }).setOrigin(0, 0).setVisible(false),
        text: this.add.text(width * 0.15, height * 0.9, "", {
          fontFamily: "Pretendard", fontSize: width*0.04, color: "#000", wordWrap: { width: width * 0.8 }, align: "left"
        }).setOrigin(0, 0).setVisible(false)
      },
      right: {
        box: this.add.image(width * 0.5, height * 0.9, "speech_right").setDisplaySize(width*0.95, height*0.15).setVisible(false),
        name: this.add.text(width * 0.10, height * 0.88, "", {
          fontFamily: "Pretendard", fontSize: width*0.03, fontStyle: "bold", color: "#000", align: "left"
        }).setOrigin(0, 0).setVisible(false),
        text: this.add.text(width * 0.15, height * 0.9, "", {
          fontFamily: "Pretendard", fontSize: width*0.04, color: "#000", wordWrap: { width: width * 0.8 }, align: "left"
        }).setOrigin(0, 0).setVisible(false)
      }
    };

    const touchIcon = this.add.image(width*0.87, height*0.95, "navi_full").setOrigin(0.5).setScale(0.1);
    this.touchTween = this.tweens.add({ targets: touchIcon, alpha: { from: 1, to: 0.4 }, duration: 700, yoyo: true, repeat: -1, hold: 50, repeatDelay: 50, ease: "Quad.easeInOut" });


    this.cameras.main.fadeIn(50, 0, 0, 0);

    // 첫 줄 보여주기
    this.showLine(this.script[this.index]);

    // 클릭 시 다음 대사
    this.input.on("pointerdown", () => {
      if (this.isTyping) {
        // 타이핑 중 클릭 → 전체 문장 즉시 출력
        this.finishTyping();
        return;
      }
      this.touchTween.restart();
      this.index++;
      if (this.index < this.script.length) {
        this.showLine(this.script[this.index]);
       } else {
        if(this.nextScene){
          if (this.rewardItem) {
            this.rewardItem.split(",").map(s => s.trim()).forEach(item => {
            console.log("[DialogScene] 보상 아이템 지급:", item);
            autoGrant(this, item);
            });
          }
          this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
        }else{
          this.scene.start(this.returnScene);
        }
      }
    });
  }

  showLine(line) {
    // 초기화
    Object.values(this.characters).forEach(c => c.setAlpha(0.5));
    Object.values(this.bubbles).forEach(b => {
      b.box.setVisible(false);
      b.text.setVisible(false);
      b.name.setVisible(false);
    });

    // 현재 줄
    const bubble = this.bubbles[line.pos];
    const char = this.characters[line.pos];
    if (!bubble || !char) return;

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
      delay: 3, // 한 글자 출력 간격(ms)
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
