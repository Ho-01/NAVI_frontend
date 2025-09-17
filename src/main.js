import Phaser from "phaser";
import TitleScene from "./scenes/TitleScene";
import LoginScene from "./scenes/LoginScene";
import ScenarioSelectScene from "./scenes/ScenarioSelectScene";
import PreloadScene from "./scenes/PreloadScene";
import DialogScene from "./scenes/DialogScene";
import CutScene from "./scenes/CutScene";
import TutorialScene from "./scenes/TutorialScene";
import MoveScene from "./scenes/MoveScene";
import UsernameInputScene from "./scenes/UsernameInputScene";
import 광화문 from "./scenes/광화문";
import ProblemScene from "./scenes/ProblemScene";
import TypeMCQScene from './scenes/problems/types/TypeMCQScene.js';
import TypeDragScene from './scenes/problems/types/TypeDragScene.js';
import TypeNumberScene from './scenes/problems/types/TypeNumberScene.js';
import * as ResultMod from './scenes/problems/scenes/ResultScene.js';
import NinePatchPlugin from 'phaser3-rex-plugins/plugins/ninepatch-plugin.js';

const ResultScene = ResultMod.default || ResultMod.ResultScene;

const config = {
  type: Phaser.AUTO,
  width: 1080,    // 기준 가로
  height: 2160,  // 기준 세로
  backgroundColor: "#222",
  parent: "game-root", // 부모 엘리먼트 고정
  dom: { createContainer: true }, // 모바일 키보드 활성화 위해 필요
  scale: {
    mode: Phaser.Scale.EXPAND,          // 화면 크기에 맞게 스케일 조정
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [TitleScene, LoginScene, ScenarioSelectScene, UsernameInputScene, 광화문,
    ProblemScene,
    PreloadScene, MoveScene, DialogScene, CutScene, TutorialScene],
  plugins: {
    global: [
      {
        key: "rexNinePatchPlugin",
        plugin: NinePatchPlugin,
        start: true,
      }
    ]
  }
};

const game = new Phaser.Game(config);

game.scene.add('RESULT', new ResultScene(), false);
// 문제 설정
const CONFIG_MAP = {
  Q01: {
    num2:'01', place:'서십자각터',
    bgKey:'bg_서십자각터', bgPath:'assets/bg/bg_서십자각터.png',
    question:'빈칸에 들어갈 것으로 알맞은 것은?',
    problemImgKey:'q01_main', problemImgPath:'assets/q01/q01_main.png',
    choiceLayout:'rowImg',
    choices:[
      {id:'A',text:'가',sideImgKey:'optA',sideImgPath:'assets/q01/optA.png'},
      {id:'B',text:'나',sideImgKey:'optB',sideImgPath:'assets/q01/optB.png'},
      {id:'C',text:'다',sideImgKey:'optC',sideImgPath:'assets/q01/optC.png'},
      {id:'D',text:'라',sideImgKey:'optD',sideImgPath:'assets/q01/optD.png'}
    ],
    correctId:'C',
    nextScene: 'CutScene',
    nextParam: 'cutscene1'
  },
  Q02: {
    num2:'02', place:'광화문',
    bgKey:'bg_광화문', bgPath:'assets/bg/bg_광화문.png',
    question:'주작/현무/기린 키를 알맞은 문에 배치하라.',
    problemImgKey:'q02_main', problemImgPath:'assets/q02/q02_main.png',
    slots:[{id:'L',x:320,y:1500,r:56},{id:'C',x:540,y:1500,r:56},{id:'R',x:760,y:1500,r:56}],
    pieces:[
      {id:'phoenix',imgKey:'phoenix',imgPath:'assets/q02/phoenix.png',start:{x:260,y:1750},displayW:120,displayH:120},
      {id:'turtle', imgKey:'turtle', imgPath:'assets/q02/turtle.png', start:{x:540,y:1750},displayW:120,displayH:120},
      {id:'qilin',  imgKey:'qilin',  imgPath:'assets/q02/qilin.png',  start:{x:820,y:1750},displayW:120,displayH:120}
    ],
    answerMap:{ phoenix:'C', turtle:'L', qilin:'R' }, snapPx:36,
    nextScene: "DialogScene",
    nextParam: "dialog_광화문_5"
  },
  Q03: {
    num2:'03', place:'흥례문',
    bgKey:'bg_흥례문', bgPath:'assets/bg/bg_흥례문.png',
    question:'문신/왕/무신을 예에 맞게 좌/중앙/우에 배치하라.',
    slots:[{id:'L',x:300,y:1500,r:56},{id:'C',x:540,y:1500,r:56},{id:'R',x:780,y:1500,r:56}],
    pieces:[
      {id:'mun', imgKey:'mun', imgPath:'assets/q03/mun.png', start:{x:260,y:1750},displayW:120,displayH:120},
      {id:'wang',imgKey:'wang',imgPath:'assets/q03/wang.png',start:{x:540,y:1750},displayW:120,displayH:120},
      {id:'mu',  imgKey:'mu',  imgPath:'assets/q03/mu.png',  start:{x:820,y:1750},displayW:120,displayH:120}
    ],
    answerMap:{ mun:'L', wang:'C', mu:'R' }, snapPx:36,
    nextScene: "DialogScene",
    nextParam: "dialog_흥례문_2"
  },
  Q04: {
    num2:'04', place:'영제교',
    bgKey:'bg_영제교', bgPath:'assets/bg/bg_영제교.png',
    question:'모두 비슷해 보여도 단 하나만 다르다. 이상한 친구는?',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'A',sideImgKey:'optA',sideImgPath:'assets/q04/optA.png'},
      {id:'B',text:'B',sideImgKey:'optB',sideImgPath:'assets/q04/optB.png'},
      {id:'C',text:'C',sideImgKey:'optC',sideImgPath:'assets/q04/optC.png'},
      {id:'D',text:'D',sideImgKey:'optD',sideImgPath:'assets/q04/optD.png'}
    ],
    correctId:'D',
    nextScene: "DialogScene",
    nextParam: "dialog_영제교_2"
  },
  Q05: {
    num2:'05', place:'수정전',
    bgKey:'bg_수정전', bgPath:'assets/bg/bg_수정전.png',
    question:'서책을 과거에서 현재 순으로 올바르게 정렬하라.',
    slots:[{id:'S1',x:240,y:1520,r:48},{id:'S2',x:420,y:1520,r:48},{id:'S3',x:600,y:1520,r:48},{id:'S4',x:780,y:1520,r:48}],
    pieces:[
      {id:'book1',imgKey:'book1',imgPath:'assets/q05/book1.png',start:{x:240,y:1750},displayW:120,displayH:120},
      {id:'book2',imgKey:'book2',imgPath:'assets/q05/book2.png',start:{x:420,y:1750},displayW:120,displayH:120},
      {id:'book3',imgKey:'book3',imgPath:'assets/q05/book3.png',start:{x:600,y:1750},displayW:120,displayH:120},
      {id:'book4',imgKey:'book4',imgPath:'assets/q05/book4.png',start:{x:780,y:1750},displayW:120,displayH:120}
    ],
    answerMap:{ book1:'S1', book2:'S2', book3:'S3', book4:'S4' }, snapPx:36,
    nextScene: "DialogScene",
    nextParam: "dialog_수정전_3"
  },
  Q06: {
    num2:'06', place:'경회루',
    bgKey:'bg_경회루', bgPath:'assets/bg/bg_경회루.png',
    question:'경회루 기둥/마루칸/중심의 수를 써라.',
    inputMask:'__, __, _',
    acceptAnswers:['12,24,3','12 24 3','12-24-3','12·24·3'],
    nextParam: "dialog_경회루_2",
    rewardItem: "item_청룡"
  },
  Q07: {
    num2:'07', place:'아미산 굴뚝 & 교태전',
    bgKey:'bg_아미산', bgPath:'assets/bg/bg_아미산.png',
    question:'장수와 부귀의 상징이 함께 깃든 것을 고르라.',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'장수',sideImgKey:'optA',sideImgPath:'assets/q07/optA.png'},
      {id:'B',text:'부귀',sideImgKey:'optB',sideImgPath:'assets/q07/optB.png'},
      {id:'C',text:'둘다',sideImgKey:'optC',sideImgPath:'assets/q07/optC.png'},
      {id:'D',text:'기타',sideImgKey:'optD',sideImgPath:'assets/q07/optD.png'}
    ],
    correctId:'C',
    nextParam: "dialog_아미산_1",
    rewardItem: "item_주작"
  },
  Q08: {
    num2:'08', place:'소주방/생물방',
    bgKey:'bg_소주방', bgPath:'assets/bg/bg_소주방.png',
    question:'진술을 근거로 수상한 인물을 고르라.',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'갑(외소주방)',sideImgKey:'optA',sideImgPath:'assets/q08/optA.png'},
      {id:'B',text:'을(생물방)',sideImgKey:'optB',sideImgPath:'assets/q08/optB.png'},
      {id:'C',text:'병(수상한 궁녀)',sideImgKey:'optC',sideImgPath:'assets/q08/optC.png'},
      {id:'D',text:'기타',sideImgKey:'optD',sideImgPath:'assets/q08/optD.png'}
    ],
    correctId:'C',
    nextScene: "DialogScene",
    nextParam: "dialog_생물방소주방_3"
  },
  Q09: {
    num2:'09', place:'플레이스홀더',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_근정전.png',
    question:'플레이스홀더 문제. 실제 기획으로 교체.',
    choiceLayout:'grid',
    choices:[
      {id:'A',text:'A',sideImgKey:'optA',sideImgPath:'assets/q09/optA.png'},
      {id:'B',text:'B',sideImgKey:'optB',sideImgPath:'assets/q09/optB.png'},
      {id:'C',text:'C',sideImgKey:'optC',sideImgPath:'assets/q09/optC.png'},
      {id:'D',text:'D',sideImgKey:'optD',sideImgPath:'assets/q09/optD.png'}
    ],
    correctId:'A',
    nextScene: "CutScene",
    nextParam: "cutscene_어둑시니등장"
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

  const base = (window.CONFIG_MAP && window.CONFIG_MAP[key]) || (typeof CONFIG_MAP !== 'undefined' ? CONFIG_MAP[key] : {}) || {};
  // null/undefined 제거
  const filteredExtra =
    extra && typeof extra === 'object'
      ? Object.fromEntries(Object.entries(extra).filter(([, v]) => v != null))
      : {};
  const data = { ...base, ...filteredExtra };

  if (mgr.isActive(key)) mgr.stop(key);
  mgr.start(key, data);
  console.log('[go] started', key);
  return true;
};