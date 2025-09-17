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

export default class TypeDragScene extends Phaser.Scene {
  constructor(id = 'DRAG') { super(id); this.sceneId = id; }
  init(cfg) { this.cfg = cfg || {}; }

  preload(){
  const C = this.cfg || {};
  const toLoad = [];

  if (C.bgKey && C.bgPath && !this.textures.exists(C.bgKey)) {
    toLoad.push({ key: C.bgKey, path: C.bgPath });
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
    const { num2, place, bgKey, question, slots = [], pieces = [], answerMap = {}, snapPx = 36, nextScene, nextParam} = this.cfg;
    console.log("[TypeDragScene]: nextScene > "+nextScene+" nextParam > "+nextParam);

    const label = buildLabel(num2, place);
    const T = window.TEXTS?.[this.scene.key] || {};
    const wrongExplain = T.wrong_explain || '';

    // 배경 + 30% 딤
    this.add.image(this.scale.width / 2, this.scale.height / 2, bgKey)
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.30);

    // 헤더 / 질문
    makeHeader(this, label);
    const qbox = makeQuestionBubble(this);
    qbox.setText(T.instruction || question || '');

    // 하단 영역(색 분리)
    makeBottomPanel(this);

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
      showHintConfirmModal(this, () => showHintLayer(this, { hint1: T.hint1, hint2: T.hint2 }));
      if (window.onHintOpen) window.onHintOpen(1);
    });

    // ===== 슬롯 렌더 =====
    const slotGfx = this.add.graphics().setDepth(Z.Content + 2);
    const slotCircle = (x, y, r, on) => {
      slotGfx.lineStyle(u(3, this), 0x222222, 0.9)
             .fillStyle(on ? 0x96A6B4 : 0x000000, on ? 0.12 : 0.08)
             .strokeCircle(x, y, r)
             .fillCircle(x, y, r);
    };
    slots.forEach(s => slotCircle(s.x, s.y, s.r, false));

    // ===== 조각 렌더 =====
    const images = [];
    pieces.forEach(p => {
      const img = this.add.image(p.start.x, p.start.y, p.imgKey)
        .setDisplaySize(p.displayW, p.displayH)
        .setDepth(Z.Content + 3)
        .setInteractive({ draggable: true, useHandCursor: true });

      img.__id = p.id;
      img.__start = { x: p.start.x, y: p.start.y };
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
      let best = null, bestD = Infinity;
      slots.forEach(s => {
        const dx = gobj.x - s.x, dy = gobj.y - s.y;
        const d = Math.hypot(dx, dy);
        if (d < bestD) { bestD = d; best = s; }
      });

      const pid = gobj.__id;

      // 스냅 or 원위치 복귀
      if (best && bestD <= snapDist && !slotTaken[best.id]) {
        const prevSlot = placed[pid];
        if (prevSlot) delete slotTaken[prevSlot];

        gobj.x = best.x; gobj.y = best.y;
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
      slots.forEach(s => slotCircle(s.x, s.y, s.r, !!slotTaken[s.id]));
    });

    // (선택) 첫 터치 시 오디오 컨텍스트 재개
    this.input.once('pointerdown', () => {
      const ctx = this.sound?.context;
      if (ctx && ctx.state !== 'running') ctx.resume();
    });
  }
}