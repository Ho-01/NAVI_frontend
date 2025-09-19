// src/types/TypeDragScene.js
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
import { getLayout } from '../ui/components.js';

export default class TypeDragScene extends Phaser.Scene {
  constructor(id = 'DRAG') { super(id); this.sceneId = id; }
  init(cfg) { this.cfg = cfg || {}; }

  preload(){
  const C = this.cfg || {};
  const toLoad = [];

  if (C.bgKey && C.bgPath && !this.textures.exists(C.bgKey)) {
    toLoad.push({ key: C.bgKey, path: C.bgPath });
  }

  // 하단영역 이미지
  if (C.problemImgKey && C.problemImgPath && !this.textures.exists(C.problemImgKey)) {
      toLoad.push({ key: C.problemImgKey, path: C.problemImgPath });
    }

  // 드래그 조각들
  (C.pieces || []).forEach(p => {
    if (p.imgKey && p.imgPath && !this.textures.exists(p.imgKey)) {
      toLoad.push({ key: p.imgKey, path: p.imgPath });
    }
  });

  toLoad.forEach(it => this.load.image(it.key, it.path));
}

  create() {
    const { num2, place, bgKey, question, hint1, hint2,
      problemImgKey, slots = [], pieces = [], answerMap = {},
      snapPx = 36, correctExplain, wrongExplain, nextScene, nextParam
    } = this.cfg;
    console.log("[TypeDragScene]: nextScene > "+nextScene+" nextParam > "+nextParam);

    const w = this.scale.width, h = this.scale.height;
    const L = getLayout(this);

    const label = buildLabel(num2, place);

    // 배경 + 30% 딤
    this.add.image(w / 2, h / 2, bgKey).setDisplaySize(w, h);
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.30);

    // 헤더 / 질문
    makeHeader(this, label);
    const qbox = makeQuestionBubble(this);
    qbox.setText(question || '');

    // ===== 하단 작업 영역(BR) 정의: 가로 w × 세로 h*0.58 =====
    const BR = {
      x: 0,
      w: w,
      h: h * 0.58,
      y: L.bottom.top - h * 0.58
    };
    if (BR.y < 0) BR.y = 0; // 안전


    // 하단 영역(색 분리)
    makeBottomPanel(this, problemImgKey);


    // ===== 문제 이미지: width=w*0.8, height=h*0.27, 상단에서 살짝 띄움 =====
    const boxW = w * 0.8;
    const boxH = h * 0.27;
    const topMargin = u(20, this);

    const src = this.textures.get(problemImgKey)?.getSourceImage(0);
    let s = 1, dispH = boxH;  // dispH은 Y 위치 계산에 사용
    if (src && src.width && src.height) {
      s = Math.min(boxW / src.width, boxH / src.height);
      dispH = src.height * s;
    }

    this.add.image(w/2, BR.y + topMargin + dispH/2, problemImgKey)
      .setScale(s)
      .setDepth(Z.Content); // 필요시 Z 조정

    // ===== 드래그 배치 상태 =====
    const placed = {};                 // pieceId -> slotId
    const slotTaken = {};              // slotId  -> pieceId
    const allSlotIds = new Set(slots.map(s => s.id));
    const snapDist = u(snapPx, this);

    // 결정 처리 (RESULT 씬으로)
    const onDecide = () => {
      const isCorrect =
        Object.entries(answerMap).every(([pid, sid]) => placed[pid] === sid) &&
        Object.keys(placed).length === Object.keys(answerMap).length;

      this.scene.launch("RESULT", {
        isCorrect,
        label,
        wrongExplain,
        prevKey: this.scene.key,
        prevCfg: this.cfg,
        correctExplain, wrongExplain,
        nextScene,
        nextParam
      });
    };

    // 도움/결정 버튼
    const { btnHelp, btnDecide } = makeBottomButtons(
      this,
      () => this.events.emit('help'),
      onDecide,
      { centerPullPx: 60 }
    );
    const setDecideEnabled = (on) => { btnDecide.__disabled = !on; btnDecide.setAlpha(on ? 1 : 0.5); };
    setDecideEnabled(false);

    // 힌트 흐름
    this.events.on('help', () => {
      showHintConfirmModal(this, () => showHintLayer(this, { hint1, hint2 }));
      if (window.onHintOpen) window.onHintOpen(1);
    });

    // ===== 좌표 변환 헬퍼(비율 → BR 내부 픽셀) =====
    const toBR = (rx, ry) => ({
      x: BR.x + rx * BR.w,
      y: BR.y + ry * BR.h
    });   

    // ===== 슬롯 렌더 =====
    const slotGfx = this.add.graphics().setDepth(Z.Content + 2);
    const slotCircle = (cx, cy, rr, on) => {
      slotGfx.lineStyle(u(3, this), 0x222222, 0.9)
             .fillStyle(on ? 0x96A6B4 : 0x000000, on ? 0.12 : 0.08)
             .strokeCircle(cx, cy, rr)
             .fillCircle(cx, cy, rr);
    };
    // 비율 좌표 → BR 내부
    slots.forEach(s => {
      const p = toBR(s.x, s.y);
      const rr = u(s.r, this);
      slotCircle(p.x, p.y, rr, false);
    });

    // ===== 조각 렌더 =====
    const images = [];
    pieces.forEach(p => {
      const start = toBR(p.start.x, p.start.y);
      const img = this.add.image(start.x, start.y, p.imgKey)
        .setDisplaySize(u(p.displayW,this), u(p.displayH,this))
        .setDepth(Z.Content + 3)
        .setInteractive({ draggable: true, useHandCursor: true });

      img.__id = p.id;
      img.__start = start;
      this.input.setDraggable(img);
      images.push(img);
    });

    // 글로벌 드래그 리스너(중복 등록 방지)
    this.input.on('drag', (pointer, gobj, dragX, dragY) => {
      if (!gobj.__id) return;
      gobj.x = dragX; gobj.y = dragY;
    });

    this.input.on('dragend', (pointer, gobj) => {
      if (!gobj.__id) return;

      // 가장 가까운 슬롯 찾기
      let best = null, bestD = Infinity, bestPx = null;
      slots.forEach(s => {
        const p = toBR(s.x, s.y);
        const d = Phaser.Math.Distance.Between(gobj.x, gobj.y, p.x, p.y);
        if (d < bestD) { bestD = d; best = s; bestPx = p; }
      });

      const pid = gobj.__id;

      // 스냅 or 원위치 복귀
      if (best && bestD <= snapDist && !slotTaken[best.id]) {
        const prevSlot = placed[pid];
        if (prevSlot) delete slotTaken[prevSlot];

        gobj.x = bestPx.x; gobj.y = bestPx.y;
        placed[pid] = best.id;
        slotTaken[best.id] = pid;
      } else {
        const prevSlot = placed[pid];
        if (prevSlot) delete slotTaken[prevSlot];
        delete placed[pid];
        gobj.x = gobj.__start.x; gobj.y = gobj.__start.y;
      }

      // 모든 슬롯 채워졌는지
      const filled = Object.keys(slotTaken).length === allSlotIds.size;
      setDecideEnabled(filled);

      // 슬롯 스타일 갱신
      slotGfx.clear();
      slots.forEach(s => {
        const p = toBR(s.x, s.y);
        slotCircle(p.x, p.y, u(s.r, this), !!slotTaken[s.id]);
      });
    });

    // (선택) 첫 터치 시 오디오 컨텍스트 재개
    this.input.once('pointerdown', () => {
      const ctx = this.sound?.context;
      if (ctx && ctx.state !== 'running') ctx.resume();
    });
  }
}