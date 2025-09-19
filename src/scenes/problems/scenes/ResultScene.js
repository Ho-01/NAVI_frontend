// src/scenes/ResultScene.js
import { NINE, COLORS } from "../styles/theme.js";

const EASE_FADE = "Cubic.Out";
const EASE_STAMP = "Back.Out";
const EASE_STAMP_PARAM = 1.2;

function u(scene, px) { return (px / 1080) * scene.scale.width; }

function ensureStampTexture(scene, key, label, color) {
  if (scene.textures.exists(key)) return key;
  const rtKey = `__temp_${key}`;
  if (scene.textures.exists(rtKey)) return rtKey;

  const w = u(scene, 300), h = u(scene, 140);
  const rt = scene.add.renderTexture(0, 0, Math.ceil(w), Math.ceil(h));
  const g = scene.add.graphics();
  g.fillStyle(color, 1).fillRoundedRect(0, 0, w, h, u(scene, 12));
  g.lineStyle(u(scene, 8), 0x000000, 0.35).strokeRoundedRect(0, 0, w, h, u(scene, 12));
  const t = scene.add.text(w/2, h/2, label, {
    fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
    fontSize: Math.floor(u(scene, 64)),
    color: "#000",
  }).setOrigin(0.5);
  rt.draw(g, 0, 0).draw(t, 0, 0);
  g.destroy(); t.destroy();
  rt.saveTexture(rtKey); rt.destroy();
  return rtKey;
}

export default class ResultScene extends Phaser.Scene {
  constructor(){ super("RESULT"); }

  create(data){
    const { isCorrect=false, label="", correctExplain="", wrongExplain="", prevKey, prevCfg, nextScene, nextParam } = data || {};
    const w = this.scale.width, h = this.scale.height;

    // 이전 씬 숨기고/정지 (입력 차단)
    if (prevKey) {
      this.scene.setVisible(false, prevKey);
      this.scene.pause(prevKey);
    }
    
    // 1) 블랙 페이드
    const black = this.add.rectangle(w/2, h/2, w, h, 0x000000, 1).setAlpha(0);
    this.tweens.add({
      targets: black, alpha: 1, duration: 300, ease: EASE_FADE,
      onComplete: () => {
        // 1-1) 300ms 홀드 후 타이틀 카드
        this.time.delayedCall(300, () =>
          this.showTitleCard({ isCorrect, label, correctExplain, wrongExplain, prevKey, prevCfg, nextScene, nextParam })
        );
      }
    });
  }

  showTitleCard({ isCorrect, label, correctExplain, wrongExplain, prevKey, prevCfg, nextScene, nextParam }){
    const w = this.scale.width, h = this.scale.height;

    // 2) 문제 라벨 박스
    const cardW = Math.min(u(this, 520), w*0.7);
    const cardH = u(this, 90);
    const y = h * 0.15;

    const card = this.add.rexNinePatch(w/2, y, cardW, cardH, "frame_plain_9", undefined, NINE.inset)
      .setOrigin(0.5).setAlpha(1);

    const title = this.add.text(w/2, y, String(label||""), {
      fontFamily: "Pretendard",
      fontSize: this.scale.width*0.06,
      color:"#ffffffff", align:"center"
    }).setOrigin(0.5).setDepth(12).setAlpha(1);

    // 3) 카드 65% 불투명도
    this.time.delayedCall(220, ()=>{
      this.tweens.add({ targets:[card, title], alpha:0.65, duration:220, ease:EASE_FADE });
    });

    // 4) 도장
    const key = isCorrect
      ? ensureStampTexture(this, "stamp_correct_temp", "정답", 0xff4d4d)
      : ensureStampTexture(this, "stamp_wrong_temp", "오답", 0x7aa7ff);

    const stamp = this.add.image(w/2, h/2, key).setDepth(13).setScale(0.2).setAngle(-8).setAlpha(0);
    this.tweens.add({
      targets: stamp, scale:1, alpha:1, angle:-2,
      duration:420, ease:EASE_STAMP, easeParams:[EASE_STAMP_PARAM]
    });

    // 5) 텀 후 분기
    this.time.delayedCall(400, ()=>{
      if (isCorrect) {
        // 정답: 탭하면 다음 씬으로 진행(있으면)
        this.input.once("pointerdown", ()=>{
          console.log('[ResultScene]: 정답');
          this.showCorrect({correctExplain, prevKey, nextScene, nextParam});
        });
      } else {
        console.log('[ResultScene]: 오답');
        this.input.once("pointerdown", ()=>{
          this.showWrong({ wrongExplain, prevKey, prevCfg });
        });
      }
    });
  }

  // 6) 오답 화면(화이트 전환 + 설명 + 다시하기)
  showWrong({ wrongExplain, prevKey, prevCfg }){
    const w = this.scale.width, h = this.scale.height;

    // const scroll = this.add.image(w/2, h/2, "scroll").setOrigin(0.5).setAlpha(0).setDepth(14);
    // scroll.setScale(Math.max(w / scroll.width, h / scroll.height));
    // this.tweens.add({ targets:scroll, alpha:1, duration:220, ease:EASE_FADE });
    const white = this.add.rectangle(w/2, h/2, w, h, 0xfffaee, 1).setAlpha(0).setDepth(14);
    this.tweens.add({ targets:white, alpha:1, duration:220, ease:EASE_FADE });

    const maxW = Math.min(w*0.72, u(this, 720));
    const maxH = u(this, 320);

    const tx = this.add.text(w/2, h*0.25, String(wrongExplain||""), {
      fontFamily: "Pretendard", 
      fontSize: w*0.04, fontStyle: "bold",
      color:"#000000", align:"center",
      wordWrap:{ width:w*0.75 }
    }).setOrigin(0.5,0.5).setDepth(15);

    // 다시하기 버튼
    const btnW=u(this, 320), btnH=u(this,112);
    const btn = this.add.rexNinePatch(w/2, h*0.75 + u(this,200), btnW, btnH, "btn_primary_9", undefined, NINE.inset)
      .setOrigin(0.5).setDepth(15).setInteractive({useHandCursor:true})
      .on("pointerdown", ()=>{
        if (prevKey) {
          // 문제 재시작(깨끗하게)
          this.scene.stop(prevKey);
          this.scene.stop("RESULT");
          this.scene.start(prevKey, prevCfg);
        } else {
          this.scene.stop("RESULT");
        }
      });

    this.add.text(btn.x, btn.y, "다시하기", {
      fontFamily: "Pretendard", 
      fontSize: this.scale.width*0.04,
      color:"#000000ff"
    }).setOrigin(0.5).setDepth(16);
  }

  
  // 7) 정답 화면(화이트 전환 + 설명 + 터치 시 다음씬)
  showCorrect({ correctExplain, prevKey, nextScene, nextParam }){
    const w = this.scale.width, h = this.scale.height;

    // const scroll = this.add.image(w/2, h/2, "scroll").setOrigin(0.5).setAlpha(0).setDepth(14);
    // scroll.setScale(Math.max(w / scroll.width, h / scroll.height));
    // this.tweens.add({ targets:scroll, alpha:1, duration:220, ease:EASE_FADE });
    const white = this.add.rectangle(w/2, h/2, w, h, 0xfffaee, 1).setAlpha(0).setDepth(14);
    this.tweens.add({ targets:white, alpha:1, duration:220, ease:EASE_FADE });

    const tx = this.add.text(w/2, h*0.25, String(correctExplain||""), {
      fontFamily: "Pretendard", 
      fontSize: w*0.04, fontStyle: "bold",
      color:"#000000", align:"center",
      wordWrap:{ width:w*0.75 }
    }).setOrigin(0.5,0.5).setDepth(15);

    // 다시하기 버튼
    const btnW=u(this, 320), btnH=u(this,112);
    const btn = this.add.rexNinePatch(w/2, h*0.75 + u(this,200), btnW, btnH, "btn_primary_9", undefined, NINE.inset)
      .setOrigin(0.5).setDepth(15).setInteractive({useHandCursor:true})
      .on("pointerdown", ()=>{
        if (prevKey) {
          console.log("[ResultScene]: nextScene >"+nextScene+" nextParam >"+nextParam);
          this.scene.stop(prevKey);
          this.scene.stop("RESULT");
          const payload = this.cache.json.get(nextParam);
          this.scene.start(nextScene, { json: payload, jsonKey: nextParam });
        } else {
          this.scene.stop("RESULT");
        }
      });

    this.add.text(btn.x, btn.y, "다음으로 이동!", {
      fontFamily: "Pretendard", 
      fontSize: this.scale.width*0.04,
      color:"#000000ff"
    }).setOrigin(0.5).setDepth(16);

    // this.input.once("pointerdown", ()=>{
    //   console.log("[ResultScene]: nextScene >"+nextScene+" nextParam >"+nextParam);
    //   this.scene.stop(prevKey);
    //   this.scene.stop("RESULT");
    //   const payload = this.cache.json.get(nextParam);
    //   this.scene.start(nextScene, { json: payload, jsonKey: nextParam });
    // });
  }
}