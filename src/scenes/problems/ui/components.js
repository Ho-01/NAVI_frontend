// src/ui/components.js
import { COLORS, Z, NINE, BUTTON } from "../styles/theme.js";

/* ---------------- Utilities ---------------- */
function u(px, scene) { return (px / 1080) * scene.scale.width; }
function safeTop(scene)    { return scene.scale.safeAreaInsets?.top || 0; }
function safeBottom(scene) { return scene.scale.safeAreaInsets?.bottom || 0; }

export function getLayout(scene){
  const w = scene.scale.width;
  const h = scene.scale.height;
  const sTop = safeTop(scene);
  const sBottom = safeBottom(scene);

  // 고정 비율(전체 h 기준)
  const headerH = h * 0.05;
  const qH      = h * 0.28;
  let   panelH  = h * 0.57;
  const bottomH = h * 0.10;

  const headerTop = sTop;
  const qTop      = headerTop + headerH;
  const panelTop  = qTop + qH;
  let   bottomTop = panelTop + panelH;

  // safeBottom 때문에 버튼 영역이 가려질 경우, panel에서 깎아내기
  const bottomEnd = bottomTop + bottomH;
  const safeEnd   = h - sBottom;
  if (bottomEnd > safeEnd) {
    const overshoot = bottomEnd - safeEnd;
    const cut = Math.min(overshoot, panelH * 0.8); // 과도하게 줄지 않게 안전빵
    panelH   -= cut;
    bottomTop = panelTop + panelH; // 버튼 영역 위로 당김
  }

  return {
    w, h, sTop, sBottom,
    header:  { top: headerTop, height: headerH, centerY: headerTop + headerH/2 },
    question:{ top: qTop,       height: qH,      centerY: qTop       + qH/2 },
    panel:   { top: panelTop,   height: panelH,  centerY: panelTop   + panelH/2 },
    bottom:  { top: bottomTop,  height: bottomH, centerY: bottomTop  + bottomH/2 },
  };
}

/* ---------------- Header (center text) ---------------- */
export function makeHeader(scene, text){
  const L =getLayout(scene);
  const {w} = L;
  const y = L.header.centerY;
  const headerH = L.header.height;

  const bg = scene.add.rectangle(w/2, y, w, headerH, 0x584721).setOrigin(0.5).setDepth(Z.Header);

  const label = scene.add
    .text(w / 2, y, String(text ?? ''), {
      fontFamily: "Pretendard",
      fontSize: w*0.05, fontStyle:"bold",
      color: "#ffffffff",
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(Z.Header + 1);

  return { bg, label, height: headerH };
}

/* ---------------- Question Bubble (시안 매칭) ----------------
 * - ③영역 세로 중앙
 * - 흰색 카드 / 검은 6px 테두리 / 모서리 16px / 아래로 그림자
 * - 텍스트는 '고정폭 박스 + 중앙 기준', 줄바꿈/패딩 균형 보장
 * - 드래그 스크롤, 드래그 중 스크롤바 표시
 */
export function makeQuestionBubble(scene){
  const L =getLayout(scene);
  const { width: w, height: h } = scene.scale;

  // 뒤 배경 (#fffaef) + 중앙 이미지(navi_full)
  const bg = scene.add.rectangle(w/2, h/2, w, h, 0xfffaef, 1).setDepth(Z.Question - 10);
  const bgImg = scene.add.image(w/2, L.question.centerY, 'navi_full').setDepth(Z.Question - 9).setAlpha(0.6);
  // 화면에 맞춰 "contain" 스케일
  const tex = scene.textures.get('navi_full')?.getSourceImage(0);
  if (tex) {
    const scale = Math.min((w*0.7) / tex.width, (L.question.height * 0.7) / tex.height);
    bgImg.setScale(scale);
  }

  // 레이아웃(있으면 사용) – 중앙 정렬 기준점
  const centerY = L ? L.question.centerY : h * 0.35; // 레이아웃 없으면 적당히 위쪽에

  // 카드 스타일
  const boxW     = w * 0.95;
  const padX     = u(40, scene);
  const padY     = u(30, scene);
  const radius   = u(16, scene);
  const borderPx = Math.max(2, Math.floor(u(6, scene)));

  // 카드(그래픽스) + 텍스트
  const cardG = scene.add.graphics().setDepth(Z.Question);
  const text = scene.add.text(0,0,'', {
    fontFamily: "Pretendard",
    fontSize: w*0.04,
    color: "#111111",
    align: "center",
    wordWrap: { width: boxW - padX*2 },
    lineSpacing: Math.floor(u(10,scene))
  })
  .setStroke('#000000', Math.max(0, Math.floor(u(2,scene))))
  .setOrigin(0.5, 0) // 가로 중앙 기준
  .setDepth(Z.Question + 1);

  // 현재 카드 높이
  let currentH = 0;

  function redraw(){
    // 텍스트 자연 높이 측정 (고정 크기 제거 후 측정)
    text.setFixedSize(0, 0);
    text.setWordWrapWidth(boxW - padX*2, true);
    const contentH = text.height;

    // 카드 높이 = (텍스트 높이 + 패딩*2)
    currentH = Math.max(u(120,scene), contentH + padY*2); // 너무 작지 않게 최소값 보정

    // 카드 그리기
    const fillCol   = Phaser.Display.Color.HexStringToColor(COLORS.bubbleFill || '#FFFFFF').color;
    const borderCol = Phaser.Display.Color.HexStringToColor(COLORS.bubbleBorder || '#000000').color;

    cardG.clear()
         .fillStyle(fillCol, 1)
         .fillRoundedRect(w/2 - boxW/2, centerY - currentH/2, boxW, currentH, radius)
         .lineStyle(borderPx, borderCol, 1)
         .strokeRoundedRect(w/2 - boxW/2, centerY - currentH/2, boxW, currentH, radius);

    // 텍스트 위치 (카드 내부 중앙 상단 + 패딩)
    text.setPosition(
      Math.round(w/2),
      Math.round(centerY - currentH/2 + padY)
    );
  }

  // 리사이즈 시 재배치
  scene.scale.on('resize', redraw);
  scene.events.once('shutdown', ()=>{
    scene.scale.off('resize', redraw);
  });

  // API
  return {
    panel: cardG,
    text,
    setText: (t)=>{
      text.setText(t || '');
      redraw();
    },
    __relayout: redraw
  };
}

/* ---------------- Bottom Panel (half screen, with anchors) ---------------- */
export function makeBottomPanel(scene, imgKey){
  const L = getLayout(scene);
  const { w } = L;
  const panelY = L.panel.centerY;
  const panelH = L.panel.height;

  const panel = scene.add
    .rectangle(w/2, panelY, w, panelH, 0xfffaee, 1)
    .setDepth(Z.Content);

  // // 예시 이미지(패널 안에 적당히)
  // scene.add.image(w/2, panelY + panelH*0.25, imgKey)
  //   .setDepth(Z.Content)
  //   .setDisplaySize(w*0.9, panelH*0.5);

  // 상단 경계선
  scene.add
    .rectangle(w/2, L.panel.top, w, u(3, scene), 0x584721)
    .setOrigin(0.5, 0)
    .setDepth(Z.Content + 1);

  // 버튼 앵커(패널 내부가 아니라 버튼 영역은 따로 있으므로 여기선 반환만)
  const pad = u(32, scene);
  const bw  = u(BUTTON.w, scene);
  const bh  = u(BUTTON.h, scene);
  const yBtn = L.bottom.centerY; // 버튼은 bottom 영역 중앙

  const leftAnchor  = { x: pad + bw/2,     y: yBtn };
  const rightAnchor = { x: w - pad - bw/2, y: yBtn };

  return { panel, y0: panelY - panelH/2, width: w, height: panelH, leftAnchor, rightAnchor };
}

/* ---------------- Single Button (compat) ---------------- */
export function makeButton(scene, opts){
  const x = opts.x, y = opts.y;
  const label = String(opts.label ?? '');
  const variant = opts.variant || 'primary';
  const disabled = !!opts.disabled;
  const onClick = typeof opts.onClick === 'function' ? opts.onClick : null;

  // 색상: 직접 지정 우선 → variant 기본
  const fill = (opts.fill != null)
    ? (typeof opts.fill === 'string'
        ? Phaser.Display.Color.HexStringToColor(opts.fill).color
        : opts.fill)
    : (variant === 'secondary'
        ? 0xdec18b   // 도움 톤
        : 0xdd8b8c); // 결정 톤

  const bw = u(300, scene), bh = u(100, scene);

  const btn = scene.add
    .rectangle(x, y, bw, bh, fill, 1)
    .setOrigin(0.5)
    .setDepth(Z.Content + 2);

  const t = scene.add.text(x, y, label, {
    fontFamily: "Pretendard",
    fontSize: Math.floor(u(40, scene)),
    color: '#111111'
  }).setOrigin(0.5).setDepth(Z.Content + 3);

  if (disabled) { btn.setAlpha(0.5); btn.__disabled = true; }

  btn.setInteractive({ useHandCursor: true }).on('pointerdown', ()=>{
    if (btn.__disabled) return;
    scene.tweens.add({ targets:[btn, t], scaleX:0.98, scaleY:0.98, duration:60, yoyo:true });
    if (onClick) onClick();
  });

  return {
    btn,
    label: t,
    setDisabled: (v)=>{
      btn.__disabled = !!v;
      const a = v ? 0.5 : 1;
      btn.setAlpha(a); t.setAlpha(a);
    }
  };
}

/* ---------------- Bottom Buttons (pair + strip) ---------------- */
export function makeBottomButtons(scene, onHelp, onDecide, options = {}){
  const L = getLayout(scene);
  const { w } = L;

  const btnW = w*0.25, btnH = L.bottom.height*0.55;

  // 하단 바 배경색: #584721
  const barH = L.bottom.height;
  const bar = scene.add.rectangle(
    w/2, L.bottom.centerY, w, barH, 0x584721, 1
  ).setDepth(Z.Content + 1);

  const y = L.bottom.centerY;

  // 도움(왼쪽) 버튼: #dec18b
  const btnHelp = scene.add.rectangle(w*0.25, y, btnW, btnH, 0xdec18b, 1)
    .setOrigin(0.5).setDepth(Z.Content + 2)
    .setInteractive({ useHandCursor:true })
    .on('pointerdown', ()=>{ onHelp && onHelp(); });

  const helpLabel = scene.add.text(w*0.25, y, '도 움', {
    fontFamily: "Pretendard", fontSize: w*0.06, fontStyle:"bold", color:'#111'
  }).setOrigin(0.5).setDepth(Z.Content + 3);

  // 결정(오른쪽) 버튼: #dd8b8c
  const btnDecide = scene.add.rectangle(w*0.75, y, btnW, btnH, 0xdd8b8c, 1)
    .setOrigin(0.5).setDepth(Z.Content + 2)
    .setInteractive({ useHandCursor:true })
    .on('pointerdown', ()=>{ if (!btnDecide.__disabled && onDecide) onDecide(); });

  const decideLabel = scene.add.text(w*0.75, y, '결 정', {
    fontFamily: "Pretendard", fontSize: w*0.06, fontStyle:"bold", color:'#111'
  }).setOrigin(0.5).setDepth(Z.Content + 3);

  return { bar, btnHelp, btnDecide, helpLabel, decideLabel };
}

/* ---------------- Hint Confirm Modal ---------------- */
export function showHintConfirmModal(scene, onYes){
  const w = scene.scale.width, h = scene.scale.height;
  const layerZ = 200;

  const dim  = scene.add.rectangle(w/2, h/2, w, h, 0x000000, 0.4).setDepth(layerZ);
  const box = scene.add.rectangle(w/2, h/2, u(720,scene), u(420,scene), 0xfffaee).setDepth(layerZ+1);
  // const box  = scene.add.rexNinePatch(w/2, h/2, u(720,scene), u(420,scene), 'modal_plain_9', undefined, NINE.inset).setDepth(layerZ+1);
  const txt  = scene.add.text(w/2, h/2 - u(80,scene), '도움이 필요해?', {
    fontFamily: "Pretendard", fontSize: Math.floor(u(46,scene)), color:'#000', align:'center'
  }).setOrigin(0.5).setDepth(layerZ+2);

  const yes = makeButton(scene, {
    x: w/2 - u(140,scene), y: h/2 + u(80,scene),
    key:'btn_primary_9', label:'예', variant:'primary',
    onClick: ()=>{ cleanup(); if (onYes) onYes(); }
  });
  const no = makeButton(scene, {
    x: w/2 + u(140,scene), y: h/2 + u(80,scene),
    key:'btn_secondary_9', label:'아니오', variant:'secondary',
    onClick: cleanup
  });

  const BTN_Z = layerZ+3;
  yes.btn.setDepth(BTN_Z); yes.label.setDepth(BTN_Z+1);
  no.btn.setDepth(BTN_Z);  no.label.setDepth(BTN_Z+1);

  function cleanup(){
    [dim, box, txt, yes.btn, yes.label, no.btn, no.label].forEach(o=>o && o.destroy());
  }
}

/* ---------------- Stepwise Hint Layer (2단계에서 버튼 숨김) ---------------- */
export function showHintLayer(scene, payload){
  const hint1 = payload?.hint1 || '';
  const hint2 = payload?.hint2 || '';
  const w = scene.scale.width, h = scene.scale.height;
  const ZL = 180;

  const dim = scene.add.rectangle(w/2, h/2, w, h, 0x000000, 0.35).setDepth(ZL);
  const box = scene.add.rectangle(w/2, h/2, u(800,scene), u(900,scene), 0xfffaee).setDepth(ZL+1);
  // const box = scene.add.rexNinePatch(w/2, h/2, u(800,scene), u(900,scene), 'modal_plain_9', undefined, NINE.inset).setDepth(ZL+1);
  const title = scene.add.text(w/2, h/2 - u(380,scene), '힌트', {
    fontFamily: "Pretendard", fontSize: Math.floor(u(50,scene)), color:'#000'
  }).setOrigin(0.5).setDepth(ZL+2);

  const text = scene.add.text(
    w/2 - u(360,scene), h/2 - u(300,scene),
    hint1,
    { fontFamily: "Pretendard", fontSize: Math.floor(u(38,scene)), color:'#000', wordWrap:{ width: u(720,scene) } }
  ).setOrigin(0,0).setDepth(ZL+2);

  let step = 1;
  const next = makeButton(scene, {
    x:w/2, y:h/2 + u(360,scene),
    key:'btn_primary_9',
    label: hint2 ? '다음 힌트 보기' : '닫기',
    onClick: ()=>{
      if (step === 1 && hint2){
        text.setText(hint2);
        step = 2;
        // 2단계에서는 버튼 숨김 (닫기는 우상단 X)
        next.btn.setVisible(false);
        next.label.setVisible(false);
      } else {
        cleanup();
      }
    }
  });
  next.btn.setDepth(ZL+3); next.label.setDepth(ZL+4);

  const closeX = scene.add.text(
    w/2 + u(360,scene), h/2 - u(380,scene), '✕',
    { fontFamily: "Pretendard", fontSize: Math.floor(u(50,scene)), color:'#000' }
  ).setOrigin(0.5).setDepth(ZL+2)
   .setInteractive({useHandCursor:true}).on('pointerdown', cleanup);

  function cleanup(){
    [dim, box, title, text, next.btn, next.label, closeX].forEach(o=> o && o.destroy());
  }
}