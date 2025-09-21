// src/types/TypeDragChangeScene.js
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

export default class TypeDragChangeScene extends Phaser.Scene {
  constructor(id = 'DRAGCHANGE') { super(id); this.sceneId = id; }
  init(cfg) { this.cfg = cfg || {}; }

  preload(){
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#fffaee");

    // 로딩중 로고
    const logo = this.add.image(width * 0.5, height * 0.3, "logo");
    logo.setDisplaySize(width * 0.3, width * 0.3);
    logo.setOrigin(0.5);
    // 로딩중 텍스트
    this.로딩중텍스트 = this.add.text(width / 2, height / 2, "문제를 준비하는 중...", {
      fontFamily: "Pretendard", fontSize: Math.round(height * 0.03),
      color: "#000000ff"
    }).setOrigin(0.5);
    // === 로더 이벤트 : 0~1 사이 진행률 ===
    this.load.on("progress", (value) => {
      const pct = Math.round(value * 100);
      this.로딩중텍스트.setText(`문제를 준비하는 중...${pct}%`);
    });

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
      problemImgKey, pieces = [], answerMap = {},
      snapPx = 36, correctExplain, wrongExplain, nextScene, nextParam
    } = this.cfg;
    console.log("[TypeDragScene]: nextScene > "+nextScene+" nextParam > "+nextParam);

    const w = this.scale.width, h = this.scale.height;
    const { width: W, height: H } = this.scale;

    const L = getLayout(this);

    const label = buildLabel(num2, place);

    // 헤더 / 질문
    makeHeader(this, label);
    const qbox = makeQuestionBubble(this);
    qbox.setText(question || '');

    // 하단 영역(색 분리)
    makeBottomPanel(this, problemImgKey);

    // ===== 문제 이미지 =====
    const boxW = w;
    const boxH = h * 0.58;

    const src = this.textures.get(problemImgKey)?.getSourceImage(0);
    let s = 1;
    if (src && src.width && src.height) {
      s = Math.min(boxW / src.width, boxH / src.height);
    }
    this.add.image(w/2, L.panel.centerY, problemImgKey)
      .setScale(s)
      .setDepth(Z.Content); // 필요시 Z 조정


    // === 유틸: 비율 → 픽셀 ===
    const px = (rx) => Math.round(rx * W);
    const py = (ry) => Math.round(ry * H);
    const pwh = (rw, rh) => ({ w: Math.round(rw * W), h: Math.round(rh * W) });

    // === 슬롯: pieces와 동일 좌표/크기로 생성 ===
    const slots = pieces.map(p => {
    const { w, h } = pwh(p.displayW, p.displayH);
    return {
        id: `slot_${p.id}`,
        cx: px(p.start.x),
        cy: py(p.start.y),
        w, h,
        r: Math.min(w, h) / 2, // 원형 슬롯 반지름(표시/스냅용)
    };
    });

    // === 슬롯 렌더 ===
    const slotGfx = this.add.graphics().setDepth(Z.Content + 2);
    const drawSlots = (takenMap) => {
    slotGfx.clear();
    slots.forEach(s => {
        const on = !!takenMap[s.id];
        slotGfx
        // .lineStyle(3, 0x222222, 0.9)
        // .fillStyle(on ? 0x96A6B4 : 0x000000, on ? 0.12 : 0.08)
        .lineStyle(0, 0x000000, 0)  // 선 없음
        .fillStyle(0x000000, 0)   // 채움 없음
        .strokeCircle(s.cx, s.cy, s.r)
        .fillCircle(s.cx, s.cy, s.r);
    });
    };
    // === 데이터 구조 ===
    const images = [];                // Phaser Images
    const placed = {};                // pieceId -> slotId
    const slotTaken = {};             // slotId  -> pieceId

    // === 조각 생성 (드래그 가능) ===
    pieces.forEach(p => {
    const { w, h } = pwh(p.displayW, p.displayH);
    const x = px(p.start.x);
    const y = py(p.start.y);

    const img = this.add.image(x, y, p.imgKey)
        .setDisplaySize(w, h)
        .setDepth(Z.Content + 3)
        .setInteractive({ draggable: true, useHandCursor: true });

    img.__id = p.id;
    img.__start = { x, y };               // 시작 위치(슬롯 바깥 복귀 대비)
    img.__size = { w, h };
    this.input.setDraggable(img);
    images.push(img);
    });

    // === 초기 점유(시작 위치가 슬롯과 동일하니 자동 배치) ===
    images.forEach(img => {
    // 가장 가까운 슬롯을 찾아 초기 배치
    let best = null, bestD = Infinity;
    slots.forEach(s => {
        const d = Phaser.Math.Distance.Between(img.x, img.y, s.cx, s.cy);
        if (d < bestD) { bestD = d; best = s; }
    });
    if (best) {
        img.x = best.cx; img.y = best.cy;
        placed[img.__id] = best.id;
        slotTaken[best.id] = img.__id;
    }
    });
    drawSlots(slotTaken);

    // === 스냅 거리(픽셀): 슬롯 크기 기반 적당한 값 ===
    const snapDist = Math.min(...slots.map(s => s.r)) * 0.8;

    // === 드래그 핸들러 ===
    this.input.on('drag', (pointer, gobj, dragX, dragY) => {
    if (!gobj.__id) return;
    gobj.x = dragX; gobj.y = dragY;
    });

    this.input.on('dragstart', (pointer, gobj) => {
    if (!gobj.__id) return;
    gobj.__prevSlot = placed[gobj.__id] || null;  // 출발 슬롯 기억(스왑 시 필요)
    });

    this.input.on('dragend', (pointer, gobj) => {
        if (!gobj.__id) return;

        // 1) 가장 가까운 슬롯 찾기
        let target = null, bestD = Infinity;
        slots.forEach(s => {
            const d = Phaser.Math.Distance.Between(gobj.x, gobj.y, s.cx, s.cy);
            if (d < bestD) { bestD = d; target = s; }
        });

        const pid = gobj.__id;
        const fromSlot = gobj.__prevSlot || null;

        // 2) 스냅 가능한가?
        if (!target || bestD > snapDist) {
            // 스냅 실패 → 원위치(원래 슬롯 or 시작점)로 복귀
            if (fromSlot && slots.find(s => s.id === fromSlot)) {
            const s = slots.find(s => s.id === fromSlot);
            gobj.x = s.cx; gobj.y = s.cy;
            } else {
            gobj.x = gobj.__start.x; gobj.y = gobj.__start.y;
            }
            return;
        }

        // 3) 타겟 슬롯 점유 상황 확인
        const occupantPid = slotTaken[target.id]; // 여기에 누가 있었나?
        if (!occupantPid || occupantPid === pid) {
            // (a) 비어 있거나 자기 자리면 → 그냥 스냅
            // 기존 자리 비우기
            if (fromSlot && slotTaken[fromSlot] === pid) delete slotTaken[fromSlot];
            placed[pid] = target.id;
            slotTaken[target.id] = pid;
            gobj.x = target.cx; gobj.y = target.cy;
        } else {
            // (b) 누가 이미 있음 → "자리 바꾸기"
            const otherImg = images.find(it => it.__id === occupantPid);
            const toSlotId = fromSlot; // 끌고 온 조각의 "출발 슬롯"으로 상대를 보낸다

            // 끌고 온 조각을 타겟 슬롯에 붙임
            placed[pid] = target.id;
            slotTaken[target.id] = pid;
            gobj.x = target.cx; gobj.y = target.cy;

            // 상대 조각을 "내가 있었던 슬롯"으로 이동 (없으면 상대 시작점)
            if (toSlotId && slots.find(s => s.id === toSlotId)) {
            const s = slots.find(s => s.id === toSlotId);
            otherImg.x = s.cx; otherImg.y = s.cy;
            placed[occupantPid] = toSlotId;
            slotTaken[toSlotId] = occupantPid;
            } else {
            // 출발 슬롯이 없었다면: 상대는 자기 시작점으로
            otherImg.x = otherImg.__start.x; otherImg.y = otherImg.__start.y;
            placed[occupantPid] = null;
            // 타겟에서 밀려났으므로, 타겟의 slotTaken은 위에서 이미 pid로 교체됨
            // 출발 슬롯 기록이 없으니 toSlotId는 채우지 않음
            }
        }

        // 4) 슬롯 스타일 갱신
        drawSlots(slotTaken);

        // 5) 모두 채워졌는지 체크 (원한다면)
        const allSlotIds = new Set(slots.map(s => s.id));
        const filled = Object.keys(slotTaken).filter(k => !!slotTaken[k]).length === allSlotIds.size;
        setDecideEnabled?.(filled);
    });

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
  }
}