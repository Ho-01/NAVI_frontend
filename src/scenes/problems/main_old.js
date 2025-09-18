import TypeMCQScene from './types/TypeMCQScene.js';
import TypeDragScene from './types/TypeDragScene.js';
import TypeNumberScene from './types/TypeNumberScene.js';
import BootTextScene from './scenes/BootTextScene.js';
import * as ResultMod from './scenes/ResultScene.js';
const ResultScene = ResultMod.default || ResultMod.ResultScene;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1080,
  height: 2160,
  backgroundColor: '#ffffff',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  dom: { createContainer: true }
});

game.scene.add('BOOT_TEXT', new BootTextScene(), true);
game.scene.add('RESULT', new ResultScene(), false);

// 문제 설정
const CONFIG_MAP = {
  Q01: {
    num2:'01', place:'서십자각터',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'빈칸에 들어갈 것으로 알맞은 것은?',
    problemImgKey:'q01_main', problemImgPath:'assets/q01/q01_main.png',
    choiceLayout:'rowImg',
    choices:[
      {id:'A',text:'가',sideImgKey:'optA',sideImgPath:'assets/q01/optA.png'},
      {id:'B',text:'나',sideImgKey:'optB',sideImgPath:'assets/q01/optB.png'},
      {id:'C',text:'다',sideImgKey:'optC',sideImgPath:'assets/q01/optC.png'},
      {id:'D',text:'라',sideImgKey:'optD',sideImgPath:'assets/q01/optD.png'}
    ],
    correctId:'C'
  },
  Q02: {
    num2:'02', place:'광화문',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'주작/현무/기린 키를 알맞은 문에 배치하라.',
    slots:[{id:'L',x:320,y:1500,r:56},{id:'C',x:540,y:1500,r:56},{id:'R',x:760,y:1500,r:56}],
    pieces:[
      {id:'phoenix',imgKey:'phoenix',imgPath:'assets/q02/phoenix.png',start:{x:260,y:1750},displayW:120,displayH:120},
      {id:'turtle', imgKey:'turtle', imgPath:'assets/q02/turtle.png', start:{x:540,y:1750},displayW:120,displayH:120},
      {id:'qilin',  imgKey:'qilin',  imgPath:'assets/q02/qilin.png',  start:{x:820,y:1750},displayW:120,displayH:120}
    ],
    answerMap:{ phoenix:'C', turtle:'L', qilin:'R' }, snapPx:36
  },
  Q03: {
    num2:'03', place:'흥례문',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'문신/왕/무신을 예에 맞게 좌/중앙/우에 배치하라.',
    slots:[{id:'L',x:300,y:1500,r:56},{id:'C',x:540,y:1500,r:56},{id:'R',x:780,y:1500,r:56}],
    pieces:[
      {id:'mun', imgKey:'mun', imgPath:'assets/q03/mun.png', start:{x:260,y:1750},displayW:120,displayH:120},
      {id:'wang',imgKey:'wang',imgPath:'assets/q03/wang.png',start:{x:540,y:1750},displayW:120,displayH:120},
      {id:'mu',  imgKey:'mu',  imgPath:'assets/q03/mu.png',  start:{x:820,y:1750},displayW:120,displayH:120}
    ],
    answerMap:{ mun:'L', wang:'C', mu:'R' }, snapPx:36
  },
  Q04: {
    num2:'04', place:'영제교',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'모두 비슷해 보여도 단 하나만 다르다. 이상한 친구는?',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'A',sideImgKey:'optA',sideImgPath:'assets/q04/optA.png'},
      {id:'B',text:'B',sideImgKey:'optB',sideImgPath:'assets/q04/optB.png'},
      {id:'C',text:'C',sideImgKey:'optC',sideImgPath:'assets/q04/optC.png'},
      {id:'D',text:'D',sideImgKey:'optD',sideImgPath:'assets/q04/optD.png'}
    ],
    correctId:'D'
  },
  Q05: {
    num2:'05', place:'수정전',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'서책을 과거에서 현재 순으로 올바르게 정렬하라.',
    slots:[{id:'S1',x:240,y:1520,r:48},{id:'S2',x:420,y:1520,r:48},{id:'S3',x:600,y:1520,r:48},{id:'S4',x:780,y:1520,r:48}],
    pieces:[
      {id:'book1',imgKey:'book1',imgPath:'assets/q05/book1.png',start:{x:240,y:1750},displayW:120,displayH:120},
      {id:'book2',imgKey:'book2',imgPath:'assets/q05/book2.png',start:{x:420,y:1750},displayW:120,displayH:120},
      {id:'book3',imgKey:'book3',imgPath:'assets/q05/book3.png',start:{x:600,y:1750},displayW:120,displayH:120},
      {id:'book4',imgKey:'book4',imgPath:'assets/q05/book4.png',start:{x:780,y:1750},displayW:120,displayH:120}
    ],
    answerMap:{ book1:'S1', book2:'S2', book3:'S3', book4:'S4' }, snapPx:36
  },
  Q06: {
    num2:'06', place:'경회루',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'경회루 기둥/마루칸/중심의 수를 써라.',
    inputMask:'__, __, _',
    acceptAnswers:['12,24,3','12 24 3','12-24-3','12·24·3']
  },
  Q07: {
    num2:'07', place:'아미산 굴뚝 & 교태전',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'장수와 부귀의 상징이 함께 깃든 것을 고르라.',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'장수',sideImgKey:'optA',sideImgPath:'assets/q07/optA.png'},
      {id:'B',text:'부귀',sideImgKey:'optB',sideImgPath:'assets/q07/optB.png'},
      {id:'C',text:'둘다',sideImgKey:'optC',sideImgPath:'assets/q07/optC.png'},
      {id:'D',text:'기타',sideImgKey:'optD',sideImgPath:'assets/q07/optD.png'}
    ],
    correctId:'C'
  },
  Q08: {
    num2:'08', place:'소주방/생물방',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'진술을 근거로 수상한 인물을 고르라.',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'갑(외소주방)',sideImgKey:'optA',sideImgPath:'assets/q08/optA.png'},
      {id:'B',text:'을(생물방)',sideImgKey:'optB',sideImgPath:'assets/q08/optB.png'},
      {id:'C',text:'병(수상한 궁녀)',sideImgKey:'optC',sideImgPath:'assets/q08/optC.png'},
      {id:'D',text:'기타',sideImgKey:'optD',sideImgPath:'assets/q08/optD.png'}
    ],
    correctId:'C'
  },
  Q09: {
    num2:'09', place:'플레이스홀더',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_seosipjagak.webp',
    question:'플레이스홀더 문제. 실제 기획으로 교체.',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'A',sideImgKey:'optA',sideImgPath:'assets/q09/optA.png'},
      {id:'B',text:'B',sideImgKey:'optB',sideImgPath:'assets/q09/optB.png'},
      {id:'C',text:'C',sideImgKey:'optC',sideImgPath:'assets/q09/optC.png'},
      {id:'D',text:'D',sideImgKey:'optD',sideImgPath:'assets/q09/optD.png'}
    ],
    correctId:'A'
  }
};

// 씬 등록
game.scene.add('Q01', new TypeMCQScene('Q01'), false);
game.scene.add('Q02', new TypeDragScene('Q02'), false);
game.scene.add('Q03', new TypeDragScene('Q03'), false);
game.scene.add('Q04', new TypeMCQScene('Q04'), false);
game.scene.add('Q05', new TypeDragScene('Q05'), false);
game.scene.add('Q06', new TypeNumberScene('Q06'), false);
game.scene.add('Q07', new TypeMCQScene('Q07'), false);
game.scene.add('Q08', new TypeMCQScene('Q08'), false);
game.scene.add('Q09', new TypeMCQScene('Q09'), false);

// 유틸
window.game = game;
window.NEXT_MAP = { Q01:'Q02', Q02:'Q03', Q03:'Q04', Q04:'Q05', Q05:'Q06', Q06:'Q07', Q07:'Q08', Q08:'Q09' };
window.go = (key, extra) => {
  const mgr = game.scene;
  if (!mgr.keys || !mgr.keys[key]) { console.error('[go] missing:', key, Object.keys(mgr.keys)); return false; }
  const data = Object.assign({}, CONFIG_MAP[key] || {}, extra || {});
  if (mgr.isActive(key)) mgr.stop(key);
  mgr.start(key, data);
  console.log('[go] started', key);
  return true;
};

// 자동 시작은 BootTextScene.create에서 처리
if (location.hash) window.go(location.hash.slice(1));