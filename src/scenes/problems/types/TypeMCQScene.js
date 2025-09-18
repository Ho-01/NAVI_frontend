// src/types/TypeMCQScene.js
import { buildLabel } from '../flows/labelHelper.js';
import {
  makeHeader,
  makeQuestionBubble,
  makeBottomPanel,
  makeBottomButtons,
  showHintConfirmModal,
  showHintLayer
} from '../ui/components.js';
import { Z, u } from '../styles/theme.js';

export default class TypeMCQScene extends Phaser.Scene {
  constructor(id = 'MCQ') { super(id); this.sceneId = id; }
  init(cfg){ this.cfg = cfg || {}; }

  preload(){
    const C = this.cfg || {};
    const toLoad = [];

    // 배경
    if (C.bgKey && C.bgPath && !this.textures.exists(C.bgKey)) {
      toLoad.push({ key: C.bgKey, path: C.bgPath });
    }
    // RowImg 전용 메인이미지
    if (C.choiceLayout === 'rowImg' && C.problemImgKey && C.problemImgPath && !this.textures.exists(C.problemImgKey)) {
      toLoad.push({ key: C.problemImgKey, path: C.problemImgPath });
    }
    // 보기 썸네일/이미지
    (C.choices || []).forEach(ch => {
      const k = ch.sideImgKey || ch.imgKey;
      const p = ch.sideImgPath || ch.imgPath;
      if (k && p && !this.textures.exists(k)) toLoad.push({ key: k, path: p });
    });

    toLoad.forEach(it => this.load.image(it.key, it.path));
  }

  create(){
    const {
      num2, place, bgKey,
      question, problemImgKey, hint1, hint2,
      choiceLayout = 'grid',
      choices = [],
      correctId,
      correctExplain,
      wrongExplain,
      nextScene,
      nextParam
    } = this.cfg;
    console.log("[TypeMCQScene]: nextScene > "+nextScene+" nextParam > "+nextParam);

    const label = buildLabel(num2, place);

    // 배경 + 30% 딤
    this.add.image(this.scale.width/2, this.scale.height/2, bgKey)
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add.rectangle(this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0x000000, 0.30);

    // 공통 UI
    makeHeader(this, label);
    const qbox = makeQuestionBubble(this);
    qbox.setText(question || '');
    const bottom = makeBottomPanel(this);

    // 선택 상태
    let selected = null;

    // 레이아웃 빌드
    const bounds = {
      x: this.scale.width / 2,
      y: bottom.y0 + u(40, this),
      w: this.scale.width - u(32 * 2, this)
    };

    // setDecideEnabled는 아래에서 정의되지만, onTap은 이후에 실행되므로 문제 없음.
    const onTapWrap = (id)=>{
      selected = (selected === id) ? null : id;
      this._updateSelection(id, selected);
      setDecideEnabled(!!selected);
    };

    if (choiceLayout === 'rowImg') {
      this._buildRowImg(bounds, problemImgKey, choices, onTapWrap);
    } else {
      this._buildGrid(bounds, choices, onTapWrap);
    }

    // 결정: RESULT 씬으로 분리
    const onDecide = () => {
      const isCorrect = !!selected && (selected === correctId);
      this.scene.launch("RESULT", {
        isCorrect,
        label,
        correctExplain, wrongExplain,
        prevKey: this.scene.key,
        prevCfg: this.cfg,
        nextScene,
        nextParam
      });
    };

    // 하단 버튼메인 이미지(카드 내부 패딩)
    const { btnDecide } = makeBottomButtons(
      this,
      () => this.events.emit('help'),
      onDecide,
      { centerPullPx: 60 }
    );
    const setDecideEnabled = (on)=>{ btnDecide.__disabled = !on; btnDecide.setAlpha(on?1:0.5); };
    setDecideEnabled(false);

    // 힌트
    this.events.on('help', ()=>{
      showHintConfirmModal(this, ()=> showHintLayer(this, { hint1, hint2 }));
      if (window.onHintOpen) window.onHintOpen(1);
    });
  }

  // ---- 그리드(2x2) 모드 (기존 유지, 원형 토큰 선택 유지) ----
  _buildGrid(bounds, choices, onTap){
    const cols = 2, gap = u(24, this);
    const cellW = (bounds.w - gap) / 2;
    const cellH = u(240, this);
    let i = 0;

    choices.forEach(ch=>{
      const cx = bounds.x - bounds.w/2 + (i%cols)*(cellW+gap) + cellW/2;
      const cy = bounds.y + Math.floor(i/cols)*(cellH+gap) + cellH/2;

      const imgKey = ch.sideImgKey || ch.imgKey || ch.id;
      const img = this.add.image(cx, cy - u(16,this), imgKey)
        .setDisplaySize(cellW, cellH - u(32,this))
        .setInteractive({ useHandCursor: true });

      const tok = this.add.circle(cx, cy + cellH/2 - u(40,this), u(48,this), 0xffffff)
        .setStrokeStyle(u(6,this), 0x999999)
        .setInteractive({ useHandCursor: true });

      img.on('pointerdown', ()=> onTap(ch.id));
      tok.on('pointerdown', ()=> onTap(ch.id));
      ch.__tok = tok; ch.__img = img; i++;
    });
  }

  
// ---- rowImg 모드: 하단 패널 안 "큰 문제이미지 + 정사각 4개" ----
_buildRowImg(bounds, problemImgKey, choices, onTap){
  const pad = u(32, this);
  const gap = u(24, this);
  const corner = u(16, this);

  // === 가용 세로 높이 계산 (하단 패널 안에서 버튼 영역 제외) ===
  const panelH = this.scale.height / 2;      // 하단 패널 자체 높이
  const topOffset = u(40, this);             // bounds.y가 패널 상단에서 내려온 값과 일치
  const reservedButtons = u(220, this);      // 버튼 높이+여백(필요 시 조절)
  const availH = Math.max(0, panelH - topOffset - reservedButtons);

  // 썸네일(정사각 4개) 폭 계산 (중복 선언 방지: usableW는 한 번만)
  const usableW = bounds.w - pad * 2;
  const thumbSide = Math.floor((usableW - gap * 3) / 4);  // 4칸 + 간격3

  // 메인카드 이상적 높이(1.5:1) vs 가용 높이에서 썸네일/간격 제외 후 가능한 최대치
  const targetRatio = 1.5;                   // (width : height)
  const mainW = bounds.w;
  const idealMainH = Math.round(mainW / targetRatio);
  const maxMainH = Math.max(u(160, this), availH - gap - thumbSide); // 최소 높이 보장
  const mainH = Math.min(idealMainH, maxMainH);

  // 카드 위치
  const mainX = bounds.x;
  const yTop  = bounds.y;

  // 1) 메인 이미지 카드(흰색 박스)
  const card = this.add.graphics().setDepth(Z.Content + 1);
  card.fillStyle(0xffffff, 1)
      .fillRoundedRect(mainX - mainW/2, yTop, mainW, mainH, corner)
      .lineStyle(u(2, this), 0x000000, 0.14)
      .strokeRoundedRect(mainX - mainW/2, yTop, mainW, mainH, corner);

  // 1-1) 내부 패딩 사각형(이미지 표시 영역) — 상하좌우 동일 패딩 + 마스크
  const innerPad = u(24, this);
  const innerW = mainW - innerPad * 2;
  const innerH = mainH - innerPad * 2;
  const innerX = Math.round(mainX - innerW / 2);
  const innerY = Math.round(yTop + innerPad);
  const innerRadius = Math.max(0, corner - innerPad);

  const maskG = this.add.graphics().setDepth(Z.Content + 2);
  maskG.fillStyle(0xffffff, 1).fillRoundedRect(innerX, innerY, innerW, innerH, innerRadius);
  const imgMask = maskG.createGeometryMask();

  if (problemImgKey && this.textures.exists(problemImgKey)) {
    // cover: 내부 사각형 꽉 채우되 잘릴 수 있음
    const tex = this.textures.get(problemImgKey).getSourceImage();
    const iw = tex.width, ih = tex.height;
    const s = Math.max(innerW / iw, innerH / ih);
    const dispW = Math.round(iw * s);
    const dispH = Math.round(ih * s);

    const img = this.add.image(
      Math.round(innerX + innerW / 2),
      Math.round(innerY + innerH / 2),
      problemImgKey
    )
      .setDisplaySize(dispW, dispH)
      .setDepth(Z.Content + 2);

    img.setMask(imgMask);
  } else {
    const ph = this.add.graphics().setDepth(Z.Content + 2);
    ph.fillStyle(0xE8E8E8, 1).fillRoundedRect(innerX, innerY, innerW, innerH, innerRadius);
    console.warn('WARN[asset-missing] problemImg', problemImgKey, this.cfg?.problemImgPath);
  }

  this.events.once('shutdown', () => { maskG.destroy(); });

  // 2) 정사각 썸네일 4개 (thumbSide 재사용; usableW 재사용)
  const rowTop = yTop + mainH + gap;

  choices.forEach((ch, idx) => {
    const left = bounds.x - mainW / 2 + pad + idx * (thumbSide + gap);
    const top  = rowTop;

    // 베이스(placeholder)
    const bg = this.add.graphics().setDepth(Z.Content + 1);
    bg.fillStyle(0xDDDDDD, 1).fillRoundedRect(left, top, thumbSide, thumbSide, u(12, this))
      .lineStyle(u(2, this), 0x000000, 0.10)
      .strokeRoundedRect(left, top, thumbSide, thumbSide, u(12, this));

    // 이미지
    const k = ch.sideImgKey || ch.imgKey || ch.id;
    if (k && this.textures.exists(k)) {
      this.add.image(left + thumbSide / 2, top + thumbSide / 2, k)
        .setDisplaySize(thumbSide, thumbSide)
        .setDepth(Z.Content + 2)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => onTap(ch.id));
    } else {
      bg.setInteractive(new Phaser.Geom.Rectangle(left, top, thumbSide, thumbSide), Phaser.Geom.Rectangle.Contains)
        .on('pointerdown', () => onTap(ch.id));
      console.warn('WARN[asset-missing] thumb', k, ch.sideImgPath || ch.imgPath);
    }

    // 선택 테두리(초기 숨김) — 6px #465A2F
    const sel = this.add.graphics().setDepth(Z.Content + 3);
    const drawSel = (on) => {
      sel.clear();
      if (on) sel.lineStyle(u(6, this), 0x465A2F, 1)
               .strokeRoundedRect(left, top, thumbSide, thumbSide, u(12, this));
    };
    drawSel(false);
    ch.__selDraw = drawSel;
  });
}

  // ---- 선택 갱신 ----
  _updateSelection(id, selected){
    (this.cfg.choices || []).forEach(ch=>{
      const on = (ch.id === selected);
      if (ch.__selDraw) ch.__selDraw(on);          // rowImg용(사각 테두리)
      if (ch.__tok) ch.__tok.setStrokeStyle(u(6,this), on ? 0x465A2F : 0x999999);  // grid용(원형 토큰)
    });
  }
}