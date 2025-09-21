// src/types/TypeNumberScene.js
import { buildLabel } from '../flows/labelHelper.js';
import {
  makeHeader,
  makeQuestionBubble,
  makeBottomPanel,
  makeBottomButtons,
  showHintConfirmModal,
  showHintLayer
} from '../ui/components.js';
import { u } from '../styles/theme.js';

function digitsOnly(s){ return (s||'').replace(/\D+/g, ''); }
function maskLen(mask){ return (mask.match(/_/g) || []).length; }
function formatWithMask(mask, digits){
  let out = '', di = 0;
  for (let i=0;i<mask.length;i++){
    if (mask[i] === '_') out += (digits[di++] || ' ');
    else out += mask[i];
  }
  return out;
}

export default class TypeNumberScene extends Phaser.Scene {
  constructor(id='NUM') { super(id); this.sceneId = id; }
  init(cfg){ this.cfg = cfg || {}; }

  preload(){
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#fffaee");

    // 로딩중 로고
    const logo = this.add.image(width * 0.5, height * 0.1, "해태");
    logo.setDisplaySize(width * 0.3, width * 0.3);
    logo.setOrigin(0.5);
    // 로딩중 텍스트
    this.로딩중텍스트 = this.add.text(width / 2, height / 2, "문제를 준비하는 중이야!", {
      fontFamily: "Pretendard", fontSize: Math.round(height * 0.03),
      color: "#000000ff"
    }).setOrigin(0.5);
    // === 로더 이벤트 : 0~1 사이 진행률 ===
    this.load.on("progress", (value) => {
      const pct = Math.round(value * 100);
      this.로딩중텍스트.setText(`로딩 중.. ${pct}%`);
    });

    const C = this.cfg || {};
    // 배경 보장
    if (C.bgKey && C.bgPath && !this.textures.exists(C.bgKey)) {
      this.load.image(C.bgKey, C.bgPath);
    }
    // 9패치 텍스처 보장 (없으면 임시 사각형으로 폴백)
    if (!this.textures.exists('frame_plain_9')) {
      this.load.image('frame_plain_9', 'assets/ui/frame_plain_9.png'); // 경로 맞게 조정
    }
  }

  create(){
    const {
      num2, place, bgKey, question,
      inputMask = '__',
      acceptAnswers = [],
      correctExplain, wrongExplain,
      nextScene, nextParam,
      hint1, hint2
    } = this.cfg;

    const label = buildLabel(num2, place);

    // 배경 + 딤
    if (bgKey && this.textures.exists(bgKey)) {
      this.add.image(this.scale.width/2, this.scale.height/2, bgKey)
        .setDisplaySize(this.scale.width, this.scale.height)
        .setDepth(1);
    }
    this.add.rectangle(this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0x000000, 0.30)
      .setDepth(2);

    // 공통 UI
    makeHeader(this, label);               // 보통 상단
    const qbox = makeQuestionBubble(this); // 문제 말풍선
    qbox.setText(question || '');

    // 하단 패널 (깊이 낮게 깔아두기)
    const bottomPanel = makeBottomPanel(this);
    if (bottomPanel?.setDepth) bottomPanel.setDepth(5);

    // 정답 집합(숫자만 비교)
    const normalizedAccept = new Set(acceptAnswers.map(digitsOnly));
    const needLen = maskLen(inputMask);

    // ===== 입력 박스 영역 (항상 최상단에 오도록 높은 depth) =====
    const DEPTH_BG   = 10000;
    const DEPTH_TEXT = 10001;

    // 위치 계산
    const boxW = Math.min(this.scale.width * 0.7, u(720,this));
    const boxH = u(110, this);
    const y = this.scale.height - this.scale.height/4 - u(140,this);

    // rexNinePatch 폴백: 플러그인 없으면 일반 사각형 사용
    let bgBox;
    if (this.add.rexNinePatch && this.textures.exists('frame_plain_9')) {
      bgBox = this.add.rexNinePatch(
        this.scale.width/2, y, boxW, boxH, 'frame_plain_9', undefined,
        { left:24, right:24, top:24, bottom:24 }
      ).setOrigin(0.5).setDepth(DEPTH_BG);
    } else {
      bgBox = this.add.rectangle(this.scale.width/2, y, boxW, boxH, 0xffffff, 1)
        .setOrigin(0.5).setDepth(DEPTH_BG)
        .setStrokeStyle(2, 0x222222, 1);
    }

    const display = this.add.text(this.scale.width/2, y, formatWithMask(inputMask, ''), {
      fontFamily: "Pretendard",
      fontSize: Math.floor(u(48,this)),
      color: '#111',
      align: 'center'
    }).setOrigin(0.5).setDepth(DEPTH_TEXT);

    // 최상단 보장
    this.children.bringToTop(display);
    this.children.bringToTop(bgBox);

    // 인풋
    const inputStyle = `
      width:${this.scale.width *0.7}px; height:${this.scale.height*0.5};
      padding: 8px 12px; font-size:${this.scale.width*0.06}px;
      border:1px solid #e5e7eb; border-radius:10px; outline:none;
      box-sizing:border-box; background:#fff;
    `;
    const dom = this.add.dom(this.scale.width *0.5, this.scale.height*0.75, "input", inputStyle, "");
    dom.setOrigin(0.5);
    // placeholder & 모바일 힌트
    dom.node.setAttribute("placeholder", "정답을 입력");
    dom.node.setAttribute("maxlength", "20");
    dom.node.setAttribute("inputmode", "decimal");
    dom.node.setAttribute("enterkeyhint", "done");
    // 포커스 유도(모바일은 사용자 제스처 후 포커스되는게 안전)
    dom.addListener("pointerdown").on("pointerdown", () => dom.node.focus());
    

    // ===== 하단 버튼 =====
    const onDecide = ()=>{
      const d = digitsOnly(dom.node?.value || '').slice(0, needLen);
      const isCorrect = normalizedAccept.has(d);
      dom?.destroy?.(true)
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

    const { btnDecide, btnHelp, container } = makeBottomButtons(
      this,
      () => this.events.emit('help'),
      onDecide,
      { centerPullPx: 60 }
    ) || {};

    // 버튼 컨테이너가 있으면 최상단으로
    if (container?.setDepth) container.setDepth(DEPTH_TEXT + 2);
    this.children.bringToTop(display);

    // decide 활성/비활성 안전 처리 (반환이 없을 수도 있어서 가드)
    const setDecideEnabled = (on)=>{
      if (!btnDecide) return;
      btnDecide.__disabled = !on;
      if (btnDecide.setAlpha) btnDecide.setAlpha(on?1:0.5);
      if (btnDecide.disableInteractive && btnDecide.enableInteractive) {
        !on ? btnDecide.disableInteractive() : btnDecide.enableInteractive();
      }
    };
    setDecideEnabled(false);

    // 입력감지용
    const sync = () => {
      const d = digitsOnly(dom.node?.value || '').slice(0, needLen);
      display.setText(formatWithMask(inputMask, d)); // 마스킹 표시 갱신
      setDecideEnabled(d.length === needLen);        // 길이 충족 시 enable
    };
    // 주요 입력 이벤트에 연결 (IME/붙여넣기 포함)
    ['input','keyup','change','paste','compositionend'].forEach(ev =>
      dom.node.addEventListener(ev, sync)
    );
    // 초기 1회 동기화
    sync();

    // ===== 힌트 =====
    this.events.on('help', ()=>{
      // T가 undefined였음 → this.cfg에서 가져오도록 수정
      showHintConfirmModal(this, ()=> showHintLayer(this, { hint1, hint2 }));
      if (window.onHintOpen) window.onHintOpen(1);
    });

    // 씬 정리 시 DOM 제거
    this.events.once('shutdown', ()=> dom?.destroy?.(true));
    this.events.once('destroy',  ()=> dom?.destroy?.(true));
  }
}
