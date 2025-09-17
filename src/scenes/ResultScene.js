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

  /**
   * data: { isCorrect, label, wrongExplain, prevKey, prevCfg }
   */
  create(data){
    const { isCorrect=false, label="", wrongExplain="", prevKey, prevCfg } = data || {};
    const w = this.scale.width, h = this.scale.height;

    // 이전 씬 숨기고/정지 (입력 차단)
    if (prevKey) {
      this.scene.setVisible(false, prevKey);
      this.scene.pause(prevKey);
    }

    // 1) 블랙 페이드
    const black = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0).setDepth(10);
    this.tweens.add({
      targets: black, alpha: 1, duration: 300, ease: EASE_FADE,
      onComplete: () => {
        // 1-1) 300ms 홀드 후 타이틀 카드
        this.time.delayedCall(300, () =>
          this.showTitleCard({ isCorrect, label, wrongExplain, prevKey, prevCfg })
        );
      }
    });
  }

  showTitleCard({ isCorrect, label, wrongExplain, prevKey, prevCfg }){
    const w = this.scale.width, h = this.scale.height;

    // 2) 문제 라벨 박스
    const cardW = Math.min(u(this, 520), w*0.7);
    const cardH = u(this, 90);
    const y = h * 0.28;

    const card = this.add.rexNinePatch(w/2, y, cardW, cardH, "frame_plain_9", undefined, NINE.inset)
      .setOrigin(0.5).setDepth(11).setAlpha(1);

    const title = this.add.text(w/2, y, String(label||""), {
      fontFamily:"SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(this, 46)),
      color:"#000", align:"center"
    }).setOrigin(0.5).setDepth(12).setAlpha(1);

    // 3) 카드 65% 불투명도
    this.time.delayedCall(220, ()=>{
      this.tweens.add({ targets:[card, title], alpha:0.65, duration:220, ease:EASE_FADE });
    });

    // 4) 도장
    const key = isCorrect
      ? ensureStampTexture(this, "stamp_correct_temp", "정답", 0xff4d4d)
      : ensureStampTexture(this, "stamp_wrong_temp", "오답", 0x7aa7ff);

    const stamp = this.add.image(w/2, y, key).setDepth(13).setScale(0.2).setAngle(-8).setAlpha(0);
    this.tweens.add({
      targets: stamp, scale:1, alpha:1, angle:-2,
      duration:420, ease:EASE_STAMP, easeParams:[EASE_STAMP_PARAM]
    });

    // 5) 텀 후 분기
    this.time.delayedCall(400, ()=>{
      if (isCorrect) {
        // 정답: 탭하면 종료(원래 씬 다시 보이게/재개)
        this.input.once("pointerdown", ()=>{
          this.scene.stop("RESULT");
          if (prevKey) {
            this.scene.setVisible(true, prevKey);
            this.scene.resume(prevKey);
          }
        });
      } else {
        this.showWrong({ wrongExplain, prevKey, prevCfg });
      }
    });
  }

  // 6) 오답 화면(화이트 전환 + 설명 + 다시하기)
  showWrong({ wrongExplain, prevKey, prevCfg }){
    const w = this.scale.width, h = this.scale.height;

    const white = this.add.rectangle(w/2, h/2, w, h, 0xffffff, 0).setDepth(14);
    this.tweens.add({ targets:white, alpha:1, duration:220, ease:EASE_FADE });

    const maxW = Math.min(w*0.72, u(this, 720));
    const maxH = u(this, 320);

    const tx = this.add.text(w/2, h/2 - u(this, 40), String(wrongExplain||""), {
      fontFamily:"SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(this, 38)),
      color:"#000", align:"center",
      wordWrap:{ width:maxW }, lineSpacing: Math.floor(u(this, 12))
    }).setOrigin(0.5,0).setDepth(15);

    // 간단 드래그 스크롤
    const maskG = this.add.graphics().setDepth(15).setVisible(false);
    maskG.fillStyle(0x000000,1).fillRect(Math.round(w/2-maxW/2), Math.round(h/2-u(this,40)), Math.round(maxW), Math.round(maxH));
    tx.setMask(maskG.createGeometryMask());
    let scrollY=0; const hit=new Phaser.Geom.Rectangle(w/2-maxW/2, h/2-u(this,40), maxW, maxH);
    this.input.on('pointermove',(p)=>{
      if (!p.isDown || !Phaser.Geom.Rectangle.Contains(hit, p.x, p.y)) return;
      const contentH=tx.height, viewH=maxH, maxScroll=Math.max(0, contentH-viewH);
      scrollY=Phaser.Math.Clamp(scrollY - p.velocity.y*0.02, 0, maxScroll);
      tx.setY(Math.round(h/2 - u(this,40) - scrollY));
    });

    // 다시하기 버튼
    const btnW=u(this, 320), btnH=u(this,112);
    const btn = this.add.rexNinePatch(w/2, h/2 + u(this,200), btnW, btnH, "btn_primary_9", undefined, NINE.inset)
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
      fontFamily:"SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(this, 44)),
      color:"#111"
    }).setOrigin(0.5).setDepth(16);
  }
}