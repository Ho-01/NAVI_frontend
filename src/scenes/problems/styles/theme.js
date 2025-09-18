export const BASE = 1080;

export const COLORS = {
  accent: '#465A2F',
  dim: 'rgba(0,0,0,0.30)',
  card: 'rgba(128,128,128,0.65)',
  contentBg: '#2E3A46',
  headerText: '#111',
  questionText: '#111',
  btnPrimaryText: '#111',
  btnSecondaryText: '#111',
  buttonBarBg: '#DEE6EE',
  bubbleFill: '#FFFFFF', // 카드 바탕
  bubbleBorder: '#00000033' // 질문박스 테두리(옅은)
};

export const NINE = { inset: { l:24, r:24, t:24, b:24 } };
export const Z = { Content:10, Question:20, Header:30 };

export const HEADER_H = 180;
export const PADDING_X = 32;
export const QBOX_MAX_H = 900;
export const QBOX_MARGIN_Y = 24;
export const QBOX_WIDTH_RATIO = 0.78;      // ★ 질문박스 폭 비율
export const TOKEN_OUTLINE = 6;

export const BUTTON = { w: 300, h: 100 };   // ★ 버튼 사이즈 다운
export const TYPO = { header: 46, question: 38, btn: 40 }; // ★ 라벨 크게

export const EASING = { fade: 'Cubic', stamp: 'Back' };
export const LOW_SPEC = { enabled:false, scale:0.7 };

export function u(px, scene){ const w = scene.scale.gameSize.width; return (px/BASE) * w; }
export function readSafeInsets(){ /* 그대로 */ }