// src/flows/resultFlow.js
// 결과 연출: 페이드아웃 → 타이틀카드 → 도장 → (오답만) 설명 + 다시하기
// 이징: 페이드 = Cubic.Out, 스탬프 = Back.Out(1.2)

import { NINE, Z, COLORS } from "../styles/theme.js";

const EASE_FADE = "Cubic.Out";
const EASE_STAMP = "Back.Out";
const EASE_STAMP_PARAM = 1.2;

function u(scene, px) { return (px / 1080) * scene.scale.width; }

function ensureStampTexture(scene, key, label, color) {
  // 키가 없으면 임시 텍스처(라벨 들어간 사각형) 생성
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

/**
 * showResult(scene, { isCorrect, label, wrongExplain }, onClose)
 * onClose({retry?: boolean})
 */
export function showResult(scene, payload, onClose) {
  const { isCorrect, label, wrongExplain } = (payload || {});
  const w = scene.scale.width;
  const h = scene.scale.height;

  const topZ = 9999;

  // 1) 전체 검은 화면으로 페이드아웃
  const black = scene.add.rectangle(w/2, h/2, w, h, 0x000000, 0)
    .setDepth(topZ);
  scene.tweens.add({
    targets: black, alpha: 1, duration: 300, ease: EASE_FADE,
    onComplete: () => afterBlackHold()
  });

  // 1-1) 300ms 홀드
  function afterBlackHold() {
    scene.time.delayedCall(300, showTitleCard);
  }

  // 2) 문제 라벨 박스 등장
  let card, cardLabel;
  let stamp;
  function showTitleCard() {
    const cardW = Math.min(u(scene, 520), w * 0.7);
    const cardH = u(scene, 90);
    const cardY = h * 0.28;

    // 배경 카드
    card = scene.add.rexNinePatch(w/2, cardY, cardW, cardH, "frame_plain_9", undefined, NINE.inset)
      .setOrigin(0.5)
      .setDepth(topZ + 1)
      .setAlpha(1);

    // 라벨 텍스트
    cardLabel = scene.add.text(w/2, cardY, String(label || ""), {
      fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(scene, 46)),
      color: "#000",
      align: "center"
    }).setOrigin(0.5).setDepth(topZ + 2).setAlpha(1);

    // 3) 잠깐 대기 후 카드 불투명도 0.65로 전환
    scene.time.delayedCall(220, () => {
      scene.tweens.add({ targets: [card, cardLabel], alpha: 0.65, duration: 220, ease: EASE_FADE });
    });

    // 4) 도장 애니메이션 (Back.Out(1.2))
    const key = isCorrect
      ? ensureStampTexture(scene, "stamp_correct_temp", "정답", 0xff4d4d)
      : ensureStampTexture(scene, "stamp_wrong_temp", "오답", 0x7aa7ff);

    stamp = scene.add.image(w/2, cardY, key)
      .setDepth(topZ + 3)
      .setScale(0.2)
      .setAngle(-8)
      .setAlpha(0);

    scene.tweens.add({
      targets: stamp,
      scale: 1,
      alpha: 1,
      angle: -2,
      duration: 420,
      ease: EASE_STAMP,
      easeParams: [EASE_STAMP_PARAM]
    });

    // 5) 잠깐 텀(400ms) 이후 분기
    scene.time.delayedCall(400, () => {
      if (isCorrect) showCorrectExit();
      else showWrongCard();
    });
  }

  // 5-1) 정답: 화면 탭 시 즉시 종료
  function showCorrectExit() {
    const tapToExit = () => {
      scene.input.off("pointerdown", tapToExit);
      cleanupAndClose();
    };
    scene.input.once("pointerdown", tapToExit);
  }

  // 6) 오답: 흰 배경으로 전환 → 설명 + [다시하기]
  function showWrongCard() {
    // 타이틀/도장은 잠시 유지 후 페이드아웃
    scene.tweens.add({ targets: [card, cardLabel, stamp], alpha: 0, duration: 220, ease: EASE_FADE });

    const white = scene.add.rectangle(w/2, h/2, w, h, 0xffffff, 0)
      .setDepth(topZ + 4);
    scene.tweens.add({ targets: white, alpha: 1, duration: 220, ease: EASE_FADE });

    // 중앙 텍스트(최대 4줄, line-height≈1.4)
    const maxW = Math.min(w * 0.72, u(scene, 720));
    const maxH = u(scene, 320); // 4줄 정도
    const tx = scene.add.text(w/2, h/2 - u(scene, 40), String(wrongExplain || ""), {
      fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(scene, 38)),
      color: "#000",
      align: "center",
      wordWrap: { width: maxW },
      lineSpacing: Math.floor(u(scene, 12))
    }).setOrigin(0.5, 0).setDepth(topZ + 5);

    // 내부 스크롤(드래그 중만)
    const maskG = scene.add.graphics().setDepth(topZ + 5).setVisible(false);
    maskG.fillStyle(0x000000, 1).fillRect(Math.round(w/2 - maxW/2), Math.round(h/2 - u(scene, 40)), Math.round(maxW), Math.round(maxH));
    const m = maskG.createGeometryMask();
    tx.setMask(m);

    let scrollY = 0;
    const hit = new Phaser.Geom.Rectangle(w/2 - maxW/2, h/2 - u(scene, 40), maxW, maxH);
    scene.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      if (!Phaser.Geom.Rectangle.Contains(hit, p.x, p.y)) return;
      const contentH = tx.height;
      const viewH = maxH;
      const maxScroll = Math.max(0, contentH - viewH);
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.02, 0, maxScroll);
      tx.setY(Math.round(h/2 - u(scene, 40) - scrollY));
    });

    // [다시하기] 버튼
    const btnW = u(scene, 320), btnH = u(scene, 112);
    const btn = scene.add.rexNinePatch(w/2, h/2 + u(scene, 200), btnW, btnH, "btn_primary_9", undefined, NINE.inset)
      .setOrigin(0.5)
      .setDepth(topZ + 5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (window.onRetry) window.onRetry();
        destroyAll();
        if (typeof onClose === "function") onClose({ retry: true });
      });

    const blabel = scene.add.text(w/2, btn.y, "다시하기", {
      fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(scene, 44)),
      color: "#111"
    }).setOrigin(0.5).setDepth(topZ + 6);

    // 정리 핸들 보관
    cleanupHandles.push(white, tx, maskG, btn, blabel);
  }

  // 공통 정리
  const cleanupHandles = [black];
  function destroyAll() {
    cleanupHandles.forEach(o => o && o.destroy());
  }
  function cleanupAndClose() {
    // 전체 오버레이 페이드아웃 후 종료
    scene.tweens.add({
      targets: cleanupHandles,
      alpha: 0,
      duration: 220,
      onComplete: () => {
        destroyAll();
        if (typeof onClose === "function") onClose({});
      }
    });
  }
}