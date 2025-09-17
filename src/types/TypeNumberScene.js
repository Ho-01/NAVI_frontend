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
  const C = this.cfg || {};
  if (C.bgKey && C.bgPath && !this.textures.exists(C.bgKey)) {
    this.load.image(C.bgKey, C.bgPath);
  }
}

  create(){
    const { num2, place, bgKey, question, inputMask = '__', acceptAnswers = [] } = this.cfg;
    const label = buildLabel(num2, place);
    const T = window.TEXTS?.[this.scene.key] || {};
    const wrongExplain = T.wrong_explain || '';

    // 배경 + 30% 딤
    this.add.image(this.scale.width/2, this.scale.height/2, bgKey)
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add.rectangle(this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0x000000, 0.30);

    // 공통 UI
    makeHeader(this, label);
    const qbox = makeQuestionBubble(this);
    qbox.setText(T.instruction || question || '');
    makeBottomPanel(this);

    // 정답 집합(숫자만 비교)
    const normalizedAccept = new Set(acceptAnswers.map(digitsOnly));
    const needLen = maskLen(inputMask);

    // 입력 박스(오버레이 텍스트)
    const boxW = Math.min(this.scale.width * 0.7, u(720,this));
    const boxH = u(110, this);
    const y = this.scale.height - this.scale.height/4 - u(140,this);

    const bg = this.add.rexNinePatch(this.scale.width/2, y, boxW, boxH, 'frame_plain_9', undefined, { left:24, right:24, top:24, bottom:24 })
      .setOrigin(0.5).setDepth(20);

    const display = this.add.text(this.scale.width/2, y, formatWithMask(inputMask, ''), {
      fontFamily: "SamKR3Font, system-ui, -apple-system, 'Noto Sans KR', sans-serif",
      fontSize: Math.floor(u(48,this)),
      color: '#111',
      align: 'center'
    }).setOrigin(0.5).setDepth(21);

    // DOM <input> (투명 1px, 네이티브 키패드)
    const dom = document.createElement('input');
    dom.setAttribute('inputmode', 'numeric');
    dom.setAttribute('type', 'text');
    dom.autocapitalize = 'off'; dom.autocomplete = 'off'; dom.autocorrect = 'off'; dom.spellcheck = false;
    Object.assign(dom.style, {
      position: 'absolute', opacity: 0.01, width: '1px', height: '1px',
      pointerEvents: 'none', zIndex: 2147483647
    });
    (this.game.canvas.parentElement || document.body).appendChild(dom);

    const focusInput = ()=> { dom.focus(); setTimeout(()=> dom.focus(), 0); };
    bg.setInteractive({ useHandCursor:true }).on('pointerdown', focusInput);
    display.setInteractive({ useHandCursor:true }).on('pointerdown', focusInput);

    const updateDisplay = ()=>{
      const d = digitsOnly(dom.value).slice(0, needLen);
      display.setText(formatWithMask(inputMask, d));
      setDecideEnabled(d.length === needLen);
    };

    dom.addEventListener('input', updateDisplay);
    this.events.once('shutdown', ()=> dom.blur());
    this.events.once('destroy', ()=> dom.remove());

    // 하단 버튼
    const onDecide = ()=>{
      const d = digitsOnly(dom.value).slice(0, needLen);
      const isCorrect = normalizedAccept.has(d);
      this.scene.launch("RESULT", {
        isCorrect,
        label,
        wrongExplain,
        prevKey: this.scene.key,
        prevCfg: this.cfg
      });
    };

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
      showHintConfirmModal(this, ()=> showHintLayer(this, { hint1: T.hint1, hint2: T.hint2 }));
      if (window.onHintOpen) window.onHintOpen(1);
    });
  }
}