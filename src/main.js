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
import TypeDragChangeScene from "./scenes/problems/types/TypeDragChangeScene.js";
import TypeNumberScene from './scenes/problems/types/TypeNumberScene.js';
import * as ResultMod from './scenes/problems/scenes/ResultScene.js';
import ninepatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import TestScene from "./TestScene.js";

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
  scene: [TestScene, TitleScene, LoginScene, ScenarioSelectScene, UsernameInputScene, 광화문,
    ProblemScene, 
    PreloadScene, MoveScene, DialogScene, CutScene, TutorialScene],
  plugins: {
    global: [
      {
        key: "rexNinePatchPlugin",
        plugin: ninepatchPlugin,
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
    question:'젊은이, 내 눈이 흐려 잘 보이질 않네…잃어버린 조각을 찾아 넣어 줄 수 있겠나... 부탁하네......',
    hint1: "잘 봐보시게…", hint2: "젊은이가 벌써 눈이 안좋나? 허허…",
    problemImgKey:'q01_main', problemImgPath:'assets/q01/q01_main.png',
    choiceLayout:'rowImg',
    choices:[
      {id:'A',text:'가',sideImgKey:'optA',sideImgPath:'assets/q01/optA.png'},
      {id:'B',text:'나',sideImgKey:'optB',sideImgPath:'assets/q01/optB.png'},
      {id:'C',text:'다',sideImgKey:'optC',sideImgPath:'assets/q01/optC.png'},
      {id:'D',text:'라',sideImgKey:'optD',sideImgPath:'assets/q01/optD.png'}
    ],
    correctId:'A',
    correctExplain: "맞는 조각을 끼워넣었다!",
    wrongExplain: "허허… 아직 멀었나?\n빈 틈새를 메워야 한다니까...?",
    nextScene: 'CutScene',
    nextParam: 'cutscene1'
  },
  Q02: {
    num2:'02', place:'광화문',
    bgKey:'bg_광화문', bgPath:'assets/bg/bg_광화문.png',
    question:'으악!! 광화문이 꽉 닫혀 버렸네!\n저 녀석이 도망치며 장난을 친 게 분명해.\n열려면 꼭 맞는 걸 찾아 끼워야 하지 않을까?',
    hint1: "광화문 출입구 안에 서서 하늘을 봐볼까?", hint2: "세 문이 얼핏 똑같아 보일 수 있지만, 천천히 다시 한 번 비교해보자!",
    problemImgKey:'q02_main', problemImgPath:'assets/q02/q02_main.png',
    slots:[{id:'L',x:0.25,y:0.3,r:100},{id:'C',x:0.5,y:0.3,r:100},{id:'R',x:0.75,y:0.3,r:100}], //width*0.195 width*0.5 width*0.805
    pieces:[ //1440 3200
      {id:'phoenix',imgKey:'phoenix',imgPath:'assets/q02/phoenix.png',start:{x:0.195,y:0.8},displayW:0.3,displayH:0.3}, //width*0.24 height*0.65
      {id:'turtle', imgKey:'turtle', imgPath:'assets/q02/turtle.png', start:{x:0.5,y:0.7},displayW:0.3,displayH:0.3}, // width*0.5
      {id:'qilin',  imgKey:'qilin',  imgPath:'assets/q02/qilin.png',  start:{x:0.81,y:0.8},displayW:0.3,displayH:0.3} // width*0.76
    ],
    answerMap:{ phoenix:'slot_turtle', turtle:'slot_phoenix', qilin:'slot_qilin' }, snapPx:36,
    correctExplain: "광화문 세 홍예의 천장을 올려다보면\n중앙에는 봉황, 동쪽에는 기린,\n서쪽에는 현무가 배치되어 있다.\n\n이들은 각각 왕권과 태평의 징조, 덕치의 길상, 그리고 수호와 장수를 상징한다.\n\n‘홍예’는 윗부분이 무지개처럼 둥근 석조 아치문을 뜻한다.",
    wrongExplain: "흠… 아닌가봐. 다시 한 번 해볼까?",
    nextScene: "DialogScene",
    nextParam: "dialog_광화문_5"
  },
  Q03: {
    num2:'03', place:'흥례문',
    bgKey:'bg_흥례문', bgPath:'assets/bg/bg_흥례문.png',
    question:'해 돋는 곳에는 문신(文臣)이 서고, 달 뜨는 곳에는 무신(武臣)이 선다.\n그 한가운데 길은 오직 왕이 지나가느니 예에 맞게 자리를 갖추라.',
    hint1: "방위는 모든 것의 시작이니, 먼저 해 뜨는 곳을 떠올려 보게", hint2: "문신은 붓으로 이 나라의 근본을 다지는 이요, 무신은 칼로써 이 땅을 지키는 이. 그 충심은 다르지 않으나, 각자의 길이 정해져 있다네.",
    problemImgKey:'q03_main', problemImgPath:'assets/q03/q03_main.png',
    slots:[{id:'L',x:0.35,y:0.725,r:56},{id:'C',x:0.5,y:0.725,r:56},{id:'R',x:0.65,y:0.725,r:56}],
    pieces:[
      {id:'mun', imgKey:'mun', imgPath:'assets/q03/mun.png', start:{x:0.15,y:0.70},displayW:0.4,displayH:0.6},
      {id:'wang',imgKey:'wang',imgPath:'assets/q03/wang.png',start:{x:0.5,y:0.70},displayW:0.4,displayH:0.6},
      {id:'mu',  imgKey:'mu',  imgPath:'assets/q03/mu.png',  start:{x:0.85,y:0.70},displayW:0.4,displayH:0.6}
    ],
    answerMap:{ mun:'slot_mu', wang:'slot_wang', mu:'slot_mun' }, snapPx:36,
    correctExplain: "근정전 앞 조정에는\n세 갈래의 삼도(三道)가 놓였으며,\n이는 왕과 신하의 위계를 드러내는 길이었다.\n\n중앙의 어도는 오직 왕만이 사용할 수 있었고, 신하들은 좌우 도로와 품계석 옆에 서열대로 도열하였다.\n\n또 출입 규칙에 따라 동쪽 일화문은 문관,\n서쪽 월화문은 무관이 드나드는 통로로 구분되었다.",
    wrongExplain: "삼도도 모르는 자를 어찌 들일 수 있겠느냐!\n\n예를 어기지 마라.\n\n중앙은 전하의 길, 신하는 좌우다.\n\n철저히 구분하라.",
    nextScene: "DialogScene",
    nextParam: "dialog_흥례문_2"
  },
  Q04: {
    num2:'04', place:'영제교',
    bgKey:'bg_영제교', bgPath:'assets/bg/bg_영제교.png',
    question:'모두 똑같아 보여도 분명 달라! 이상한 친구를 찾아보자!',
    hint1: "흠… 네 친구 다 똑같진 않은 것 같아. 딱 하나만 이상해 보여!", hint2: "“👅”",
    problemImgKey:'q04_main', problemImgPath:'assets/q04/q04_main.png',
    choiceLayout:'rowImg',
    choices:[
      {id:'A',text:'A',sideImgKey:'bridgeA',sideImgPath:'assets/q04/optA.png'},
      {id:'B',text:'B',sideImgKey:'bridgeB',sideImgPath:'assets/q04/optB.png'},
      {id:'C',text:'C',sideImgKey:'bridgeC',sideImgPath:'assets/q04/optC.png'},
      {id:'D',text:'D',sideImgKey:'bridgeD',sideImgPath:'assets/q04/optD.png'}
    ],
    correctId:'D',
    correctExplain: "영제교의 혀 내민 천록상은 전통적인 신수 도상에서 혀를 드러내는 표현을 반영했을 가능성이 있다.\n동시에 엄숙한 궁궐에 해학을 담아 친근감을 주려 했다는 해석도 있으나,\n특별한 의미가 확정된 바는 없고 의도 역시 문헌에서 명확히 확인되지 않는다.",
    wrongExplain: "응? 이 친구는 아니야",
    nextScene: "DialogScene",
    nextParam: "dialog_영제교_2"
  },
  Q05: {
    num2:'05', place:'수정전',
    bgKey:'bg_수정전', bgPath:'assets/bg/bg_수정전.png',
    question:'서책을 정리하는 이치는 간단하다.\n이 서책들은 명칭 혹은 쓰임의 변화를 기준으로 엮은 기록이다.\n순서는 과거에서 오늘로 이어지도록 해야한다.',
    hint1: "이 기록들은 모두 한 공간의 이야기를 담고 있다네. 가장 오래된 기록부터 차례대로 놓아야 하네", hint2: "서책에 적힌 이름들이 사용되던 시기가 언제인지 찬찬히 다시 한 번 살펴보게나",
    problemImgKey:'q05_main', problemImgPath:'assets/q05/q05_main.png',
    slots:[{id:'S1',x:0.35,y:0.675,r:48},{id:'S2',x:0.44,y:0.675,r:48},{id:'S3',x:0.53,y:0.675,r:48},{id:'S4',x:0.625,y:0.675,r:48}],
    pieces:[
      {id:'book1',imgKey:'book1',imgPath:'assets/q05/book1.png',start:{x:0.125,y:0.85},displayW:60,displayH:240},
      {id:'book2',imgKey:'book2',imgPath:'assets/q05/book2.png',start:{x:0.375,y:0.85},displayW:60,displayH:240},
      {id:'book3',imgKey:'book3',imgPath:'assets/q05/book3.png',start:{x:0.625,y:0.85},displayW:60,displayH:240},
      {id:'book4',imgKey:'book4',imgPath:'assets/q05/book4.png',start:{x:0.875,y:0.85},displayW:60,displayH:240}
    ],
    answerMap:{ book1:'S1', book2:'S2', book3:'S3', book4:'S4' }, snapPx:36,
    correctExplain: "수정전은 세종 때 학문 연구 기관인 집현전(‘어진 사람을 모은 전각’)으로 시작해,\n고종의 중건 과정에서 수정전으로 불리며 왕의 정사를 보좌하는 공간이 되었다. 갑오개혁기에는 내각 청사로 활용되었고, 오늘날 복원되어 다시 수정전이라는 이름으로 전해진다.\n이러한 변화는 단순한 명칭 교체가 아니라, 건물이 맡아온 기능과 정치적 역할의 변천을 보여준다.",
    wrongExplain: "이런, 그 순서가 아닌 것 같군 .다시 한번 생각해 보게나",
    nextScene: "DialogScene",
    nextParam: "dialog_수정전_3"
  },
  Q06: {
    num2:'06', place:'경회루',
    bgKey:'bg_경회루', bgPath:'assets/bg/bg_경회루.png',
    question:'버드나무와 어우러지는 경회루의 품위있는 모습이 보이는가.\n가장 바깥 기둥들은 절기(節氣)의 바퀴를 이루고,\n그 안의 마루칸들은 차고 기우는 달(月)의 걸음을 헤아리며,\n그 중심으로는 천‧지‧인(三才)이 정좌하여 하늘과 땅을 잇는다.\n겉은 때의 질서요, 그 중심은 사람의 자리이니—\n이 누각은 곧 우주의 질서를 형상화한 것이다…\n이제 네 눈과 손으로 그 수를 밝혀 보이라.',
    hint1: "이 누각의 기둥은 절기를, 마루칸은 달을, 중심은 천지인을 나타내고 있느니. 겉에서부터 안으로, 그 순서대로 수를 헤아리라.", hint2: "정 어렵다면 경회루를 보며 그 수를 세어보는 것도 방법이지",
    inputMask:'__, __, _',
    acceptAnswers:['24,12,3','24 12 3','24-12-3','24·12·3'],
    correctExplain: "경회루 2층 마루의 3칸·12칸·24기둥을 천지인, 12달, 24절기에 대응시키는 해석은\n동아시아적 우주 질서를 건축에 투영한 전통적 설명이다.\n이는 경회루가 단순한 연회장이 아니라, 왕권과 국가를 천지자연의 질서와 연결하려 한 상징 공간이었음을 보여준다.",
    wrongExplain: "이치를 깨닫지 못했는가? 겉은 때의 질서요, 안은 달의 걸음, 중심은 만물의 근본을 담고 있거늘",
    nextScene: "DialogScene",
    nextParam: "dialog_경회루_2"
  },
  Q07: {
    num2:'07', place:'아미산 굴뚝 & 교태전',
    bgKey:'bg_아미산', bgPath:'assets/bg/bg_아미산.png',
    question:'네가 나의 어패를 얻고자 하거든,\n백악의 정기를 침전까지 이어주는곳에서\n장수(壽)와 부귀(富貴)의 소망이 모두 깃든 것을 밝혀내거라',
    hint1: "그대, 왕비의 후원인 아미산 정원은 뒷산인 백악의 정기를 침전까지 이어주는 곳이니 그곳으로 향해야 할 것이다.", hint2: "아미산 정원의 굴뚝에는 만물의 영원함을 바라는 십장생(학, 사슴, 거북 등)과 고귀한 복을 기원하는 부귀(봉황, 박쥐, 매화 등)의 상징이 함께하느니. 그 모든 소망이 깃든 것을 밝혀내거라.",
    problemImgKey:'q07_main', problemImgPath:'assets/q07/q07_main.png',
    choiceLayout:'rowImg',
    choices:[
      {id:'A',text:'장수',sideImgKey:'tile1',sideImgPath:'assets/q07/tile1.png'},
      {id:'B',text:'부귀',sideImgKey:'tile2',sideImgPath:'assets/q07/tile2.png'},
      {id:'C',text:'둘다',sideImgKey:'tile3',sideImgPath:'assets/q07/tile3.png'},
      {id:'D',text:'기타',sideImgKey:'tile4',sideImgPath:'assets/q07/tile4.png'}
    ],
    correctId:'C',
    correctExplain: "아미산 굴뚝에는 학과 거북, 사슴 같은 십장생이 장수를, 봉황과 박쥐, 매화가 부귀와 길상을 상징한다.\n굴뚝은 단순한 난방 시설이 아니라 왕비의 안녕과 나라의 태평을 기원하는 상징물이었으며,\n‘장수와 부귀의 소망이 함께 깃든 곳’이라는 의미도 담고 있다.",
    wrongExplain: "네 눈이 아직 이 굴뚝에 담긴 온전한 소망을 담지 못했구나.\n장수(壽)의 기운과 부귀(富貴)의 소망이 한데 어우러진 곳을 다시 찾아보거라",
    nextScene: "DialogScene",
    nextParam: "dialog_아미산_1"
  },
  Q08: {
    num2:'08', place:'소주방/생물방',
    bgKey:'bg_소주방', bgPath:'assets/bg/bg_소주방.png',
    question:'갑 (외소주방 소속): "저는 임금님 탄신일 잔치 음식에 쓸 귀한 재료를 손질하고 있었어요!"\n을 (생물방 소속): " 내소주방과 외소주방에 보낼 차와 다과를 만드느라 쉴 틈이 없었다고요!"\n병 (수상한 궁녀): "저는 외소주방에서 화채를 준비하고 있었어요!',
    hint1: "내소주방, 외소주방… 이름만 비슷하고 대체 어디가 어디지?", hint2: "어디서 어떤 음식을 준비하는건지 알아봐야겠어",
    problemImgKey:'q08_main', problemImgPath:'assets/q08/q08_main.png',
    choiceLayout:'rowImg',
    choices:[
      {id:'A',text:'갑(외소주방)',sideImgKey:'charA',sideImgPath:'assets/q08/charA.png'},
      {id:'B',text:'을(생물방)',sideImgKey:'charB',sideImgPath:'assets/q08/charB.png'},
      {id:'C',text:'병(수상한 궁녀)',sideImgKey:'charC',sideImgPath:'assets/q08/charC.png'},
    ],
    correctId:'C',
    correctExplain: "외소주방은 왕의 탄신일이나 큰 연회의 음식을 맡던 공간이고,\n생물방(=생과방)은 교태전 뒤쪽에서 차·다과·화채 같은 후식과 음료를 준비하는 부속 공간이었다.\n따라서 “외소주방에서 화채를 준비했다”는 말은 실제 궁중 업무 체계와 맞지 않아 수상하다.",
    wrongExplain: "다시 생각해보자",
    nextScene: "DialogScene",
    nextParam: "dialog_생물방소주방_3"
  },
  Q09: {
    num2:'09', place:'근정전',
    bgKey:'bg_seosipjagak', bgPath:'assets/bg/bg_근정전.png',
    question:'사방신 석상에 어패를 올바르게 끼워넣자!',
    hint1: "현무의 튼튼한 등껍질, 백호의 용맹한 이빨!, 청룡의 푸른 비늘, 주작의 불꽃과 같은 날개를 잘 찾아봐!!", hint2: "서둘러! 좌청룡·우백호·전주작·후현무야!",
    problemImgKey:'q09_main', problemImgPath:'assets/q09/q09_main.png',
    slots:[{id:'S1',x:0.35,y:0.375,r:48},{id:'S2',x:0.65,y:0.375,r:48},{id:'S3',x:0.5,y:0.4,r:48},{id:'S4',x:0.5,y:0.175,r:48}],
    pieces:[
      {id:'item1',imgKey:'item1',imgPath:'assets/q09/item_청룡.png',start:{x:0.125,y:0.85},displayW:60,displayH:240},
      {id:'item2',imgKey:'item2',imgPath:'assets/q09/item_백호.png',start:{x:0.375,y:0.85},displayW:60,displayH:240},
      {id:'item3',imgKey:'item3',imgPath:'assets/q09/item_주작.png',start:{x:0.625,y:0.85},displayW:60,displayH:240},
      {id:'item4',imgKey:'item4',imgPath:'assets/q09/item_현무.png',start:{x:0.875,y:0.85},displayW:60,displayH:240}
    ],
    answerMap:{ item1:'S1', item2:'S2', item3:'S3', item4:'S4' }, snapPx:36,
    correctExplain: "사방신은 단순한 장식이 아니라, 오행·천문·자연지형이 맞물린 질서를 반영한 우주의 상징이다.\n청룡은 해돋이와 성장·생명을, 주작은 권위와 번영을, 백호는 억제와 보호를, 현무는 안정과 방어를 의미하며,\n방위에 따라 배치되어 우주의 질서를 구현한다. 근정전은 이러한 사방신 배치를 통해 왕이 정사를 펼치는 공간으로서 잡귀와 부정을 차단하고,\n왕실의 기운이 사방으로 퍼져 국가의 조화와 번영을 확장하기를 바라는 의식적 장치로 기능하였다.",
    wrongExplain: "이런! 어패의 기운이 엉뚱한 곳을 가리키고 있어!!",
    nextScene: "DialogScene",
    nextParam: "dialog_근정전_3"
  }
};

// 씬 등록
game.scene.add('Q01', new TypeMCQScene('Q01'), false);
game.scene.add('Q02', new TypeDragChangeScene('Q02'), false);
game.scene.add('Q03', new TypeDragChangeScene('Q03'), false);
game.scene.add('Q04', new TypeMCQScene('Q04'), false);
game.scene.add('Q05', new TypeDragScene('Q05'), false);
game.scene.add('Q06', new TypeNumberScene('Q06'), false);
game.scene.add('Q07', new TypeMCQScene('Q07'), false);
game.scene.add('Q08', new TypeMCQScene('Q08'), false);
game.scene.add('Q09', new TypeDragScene('Q09'), false);

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