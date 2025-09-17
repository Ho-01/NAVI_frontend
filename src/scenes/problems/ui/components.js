// src/ui/components.js
import { COLORS, Z, NINE, BUTTON } from "../styles/theme.js";

/* ---------------- Utilities ---------------- */
function u(px, scene) { return (px / 1080) * scene.scale.width; }
function safeTop(scene)    { return scene.scale.safeAreaInsets?.top || 0; }
function safeBottom(scene) { return scene.scale.safeAreaInsets?.bottom || 0; }

/* ---------------- Header (180px, 9-slice, center text) ---------------- */
export function makeHeader(scene, text){
  const w = scene.scale.width;
  const headerH = u(180, scene);
  const y = safeTop(scene) + headerH / 2;

  const bg = scene.add
    .rexNinePatch(w / 2, y, w, headerH, "frame_plain_9", undefined, NINE.inset)
    .setOrigin(0.5)
    .setDepth(Z.Header);

  const label = scene.add
    .text(w / 2, y, String(text ?? ''), {
      fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(48, scene)),
      color: "#111",
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
  const w = scene.scale.width;
  const h = scene.scale.height;

  const safeT = safeTop(scene);
  const safeB = safeBottom(scene);
  const headerH = u(180, scene);
  const bottomPanelH = h / 2;

  const availH  = h - safeT - headerH - bottomPanelH - safeB;
  const centerY = safeT + headerH + availH / 2;

  const boxW   = w * 0.78;
  const maxH   = u(900, scene);
  const padX   = u(40, scene);
  const padY   = u(30, scene);
  const radius = u(16, scene);               // ← 요청대로 16px
  const borderPx = Math.max(2, Math.floor(u(6, scene)));

  // 그림자
  const shadow = scene.add.graphics().setDepth(Z.Question - 1);
  shadow.fillStyle(0x000000, 0.20)
        .fillRoundedRect(w/2 - boxW/2 + u(2,scene), centerY - maxH/2 + u(6,scene), boxW, maxH, radius);

  // 카드(흰) + 테두리
  const cardG = scene.add.graphics().setDepth(Z.Question);

  // 텍스트 (중앙 기준)
  const text = scene.add.text(0,0,'', {
    fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
    fontSize: Math.floor(u(50,scene)),
    color: "#111111",
    align: "center",
    wordWrap: { width: boxW - padX*2 },
    lineSpacing: Math.floor(u(10,scene))
  })
  .setStroke('#000000', Math.max(0, Math.floor(u(2,scene))))
  .setOrigin(0.5, 0) // ⬅️ 가로 중앙 기준
  .setDepth(Z.Question + 1);

  // 마스크(내부만 보이게)
  const clip = scene.add.graphics().setVisible(false);
  const mask = clip.createGeometryMask();
  text.setMask(mask);

  // 스크롤 상태
  let scrollY = 0;
  let currentH = maxH;
  let contentHeight = 0; // 자연 높이(고정 크기 적용 전 측정값)

  // DOM 스크롤바
  const bar = document.createElement('div');
  bar.className = 'q-scrollbar';
  (scene.game.canvas.parentElement || document.body).appendChild(bar);
  let hideTimer = null;

  function layoutScrollbar(viewH){
    const r  = scene.game.canvas.getBoundingClientRect();
    const vx = r.left + (w/2 + boxW/2 - 10) * (r.width / scene.scale.width);
    const vy = r.top  + (centerY - currentH/2 + 8) * (r.height / scene.scale.height);
    const vh = (currentH - 16) * (r.height / scene.scale.height);

    const ratio  = viewH / Math.max(viewH, contentHeight);
    const barH   = Math.max(12, vh * ratio);
    const maxY   = Math.max(0, contentHeight - viewH);
    const prog   = maxY > 0 ? (scrollY / maxY) : 0;
    const barY   = vy + (vh - barH) * prog;

    const st = bar.style;
    st.position = 'absolute';
    st.left = `${vx}px`;
    st.top = `${barY}px`;
    st.height = `${barH}px`;
  }
  function showBar(show){
    if (show){
      bar.classList.add('show');
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(()=> bar.classList.remove('show'), 350);
    } else {
      bar.classList.remove('show');
    }
  }

  function drawCard(){
    const contentW = boxW - padX*2;

    // 자연 높이 측정(고정 크기 제거 후 측정)
    text.setFixedSize(0,0);
    text.setWordWrapWidth(contentW, true);
    contentHeight = text.height;

    // 카드 높이 결정
    currentH = Math.min(contentHeight + padY*2, maxH);
    const viewH = currentH - padY*2;

    // 카드
    const fillCol   = Phaser.Display.Color.HexStringToColor(COLORS.bubbleFill || '#FFFFFF').color;
    const borderCol = Phaser.Display.Color.HexStringToColor(COLORS.bubbleBorder || '#000000').color;

    cardG.clear()
         .fillStyle(fillCol, 1)
         .fillRoundedRect(w/2 - boxW/2, centerY - currentH/2, boxW, currentH, radius)
         .lineStyle(borderPx, borderCol, 1)
         .strokeRoundedRect(w/2 - boxW/2, centerY - currentH/2, boxW, currentH, radius);

    // 텍스트 고정 크기 + 중앙 배치 + 스크롤 반영
    text.setFixedSize(contentW, viewH);
    text.setPosition(Math.round(w/2),
                     Math.round(centerY - currentH/2 + padY - scrollY));

    // 마스크
    clip.clear()
        .fillStyle(0x000000, 0)
        .fillRect(w/2 - boxW/2 + borderPx, centerY - currentH/2 + borderPx,
                  boxW - borderPx*2, currentH - borderPx*2);

    // 스크롤바
    layoutScrollbar(viewH);
  }

  function setScroll(y){
    const viewH = currentH - padY*2;
    const maxY  = Math.max(0, contentHeight - viewH);
    scrollY     = Phaser.Math.Clamp(y, 0, maxY);
    text.setY(Math.round(centerY - currentH/2 + padY - scrollY));
    layoutScrollbar(viewH);
  }

  // 드래그 스크롤(휠 무시)
  const hit = new Phaser.Geom.Rectangle(w/2 - boxW/2, centerY - currentH/2, boxW, currentH);
  scene.input.on('pointerdown', (p)=> {
    if (Phaser.Geom.Rectangle.Contains(hit, p.x, p.y)) showBar(true);
  });
  scene.input.on('pointermove', (p)=>{
    if (p.isDown && Phaser.Geom.Rectangle.Contains(hit, p.x, p.y)){
      setScroll(scrollY - p.velocity.y * 0.02);
      showBar(true);
    }
  });

  // 리사이즈/종료
  scene.scale.on('resize', drawCard);
  scene.events.once('shutdown', ()=>{
    if (hideTimer) clearTimeout(hideTimer);
    bar.remove();
  });

  return {
    panel: cardG,
    text,
    setText: (t)=>{
      text.setText(t || '');
      scrollY = 0;
      drawCard();
    },
    __relayout: drawCard
  };
}

/* ---------------- Bottom Panel (half screen, with anchors) ---------------- */
export function makeBottomPanel(scene){
  const w = scene.scale.width;
  const h = scene.scale.height;
  const safeB = safeBottom(scene);
  const panelY = h - safeB - h / 4;

  const color = Phaser.Display.Color.HexStringToColor(COLORS.contentBg).color;
  const panel = scene.add.rectangle(w/2, panelY, w, h/2, color, 1).setDepth(Z.Content);

  // 상단 경계선
  scene.add
    .rectangle(w / 2, panelY - h / 4, w, u(2, scene), 0xffffff, 0.25)
    .setOrigin(0.5, 0)
    .setDepth(Z.Content + 1);

  // 버튼 앵커 반환
  const pad = u(32, scene);
  const bw  = u(BUTTON.w, scene);
  const bh  = u(BUTTON.h, scene);
  const yBtn = h - safeB - bh/2 - u(32, scene);

  const leftAnchor  = { x: pad + bw/2,      y: yBtn };
  const rightAnchor = { x: w - pad - bw/2,  y: yBtn };

  return { panel, y0: (h/2), width: w, height: h/2, leftAnchor, rightAnchor };
}

/* ---------------- Single Button (compat) ---------------- */
export function makeButton(scene, opts){
  const x = opts.x, y = opts.y;
  const key = opts.key || 'btn_primary_9';
  const label = String(opts.label ?? '');
  const variant = opts.variant || 'primary';
  const disabled = !!opts.disabled;
  const onClick = typeof opts.onClick === 'function' ? opts.onClick : null;

  const bw = u(300, scene), bh = u(100, scene);
  const btn = scene.add.rexNinePatch(x, y, bw, bh, key, undefined, NINE.inset)
    .setOrigin(0.5).setDepth(Z.Content + 2);

  const color = (variant === 'secondary') ? (COLORS.btnSecondaryText || '#111') : (COLORS.btnPrimaryText || '#111');
  const t = scene.add.text(x, y, label, {
    fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
    fontSize: Math.floor(u(40, scene)),
    color
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
  const w = scene.scale.width;
  const h = scene.scale.height;
  const safeB = safeBottom(scene);
  const centerPullPx = (typeof options.centerPullPx === 'number') ? options.centerPullPx : 60;

  const btnW = u(300, scene), btnH = u(100, scene);
  const marginX = u(32, scene);
  const centerPull = u(centerPullPx, scene);

  // 스트립(밴드) 배경
  const barH = u(options.barHeightPx ?? 160, scene);
  const barColor = Phaser.Display.Color.HexStringToColor(
    (options.barColor ?? (COLORS.buttonBarBg || '#E3E8EE'))
  ).color;
  const bar = scene.add.rectangle(
    w/2, h - safeB - barH/2, w, barH, barColor, 1
  ).setDepth(Z.Content + 1);

  const y = bar.y; // 스트립 중앙에 버튼 배치

  const xLeft  = marginX + btnW/2 + centerPull;
  const xRight = w - marginX - btnW/2 - centerPull;

  // 도움
  const btnHelp = scene.add
    .rexNinePatch(xLeft, y, btnW, btnH, 'btn_secondary_9', undefined, NINE.inset)
    .setOrigin(0.5).setDepth(Z.Content + 2)
    .setInteractive().on('pointerdown', ()=>{ onHelp && onHelp(); });

  const helpLabel = scene.add.text(xLeft, y, '도움', {
    fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
    fontSize: Math.floor(u(40, scene)), color:'#111'
  }).setOrigin(0.5).setDepth(Z.Content + 3);

  // 결정
  const btnDecide = scene.add
    .rexNinePatch(xRight, y, btnW, btnH, 'btn_primary_9', undefined, NINE.inset)
    .setOrigin(0.5).setDepth(Z.Content + 2)
    .setInteractive().on('pointerdown', ()=>{ if (!btnDecide.__disabled && onDecide) onDecide(); });

  const decideLabel = scene.add.text(xRight, y, '결정', {
    fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
    fontSize: Math.floor(u(40, scene)), color:'#111'
  }).setOrigin(0.5).setDepth(Z.Content + 3);

  return { bar, btnHelp, btnDecide, helpLabel, decideLabel };
}

/* ---------------- Hint Confirm Modal ---------------- */
export function showHintConfirmModal(scene, onYes){
  const w = scene.scale.width, h = scene.scale.height;
  const layerZ = 200;

  const dim  = scene.add.rectangle(w/2, h/2, w, h, 0x000000, 0.4).setDepth(layerZ);
  const box  = scene.add.rexNinePatch(w/2, h/2, u(720,scene), u(420,scene), 'modal_plain_9', undefined, NINE.inset).setDepth(layerZ+1);
  const txt  = scene.add.text(w/2, h/2 - u(80,scene), '도움이 필요해?', {
    fontFamily:'SamKR3Font', fontSize: Math.floor(u(46,scene)), color:'#000', align:'center'
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
  const box = scene.add.rexNinePatch(w/2, h/2, u(800,scene), u(900,scene), 'modal_plain_9', undefined, NINE.inset).setDepth(ZL+1);
  const title = scene.add.text(w/2, h/2 - u(380,scene), '힌트', {
    fontFamily:'SamKR3Font', fontSize: Math.floor(u(50,scene)), color:'#000'
  }).setOrigin(0.5).setDepth(ZL+2);

  const text = scene.add.text(
    w/2 - u(360,scene), h/2 - u(300,scene),
    hint1,
    { fontFamily:'SamKR3Font', fontSize: Math.floor(u(38,scene)), color:'#000', wordWrap:{ width: u(720,scene) } }
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
    { fontFamily:'SamKR3Font', fontSize: Math.floor(u(50,scene)), color:'#000' }
  ).setOrigin(0.5).setDepth(ZL+2)
   .setInteractive({useHandCursor:true}).on('pointerdown', cleanup);

  function cleanup(){
    [dim, box, title, text, next.btn, next.label, closeX].forEach(o=> o && o.destroy());
  }
}