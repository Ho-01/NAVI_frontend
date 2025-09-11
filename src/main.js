import TypeMCQScene from "./types/TypeMCQScene.js";
import TypeDragScene from "./types/TypeDragScene.js";
import TypeNumberScene from "./types/TypeNumberScene.js";
import Q06_Sujungjeon from "./scenes/Q06_Sujungjeon.js";

// Phaser.Game
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: "#000000",
  width: 1080,
  height: 2160,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  dom: { createContainer: true }, // Q06 DOM 입력용
  // rexNinePatch 글로벌 플러그인 (index.html에서 UMD 로드 가정)
  plugins: {
    global: window.rexNinePatchPlugin
      ? [{ key: 'rexNinePatchPlugin', plugin: window.rexNinePatchPlugin, start: true }]
      : []
  }
});

/**
 * 테스트용 씬 등록 (모두 autoStart=false)
 * 필요 시 콘솔에서 game.scene.start('Q02') 처럼 수동 시작
 */

// Q01: 객관식(서십자각터)
game.scene.add("Q01", new TypeMCQScene("Q01"), false, {
  num2: "01",
  place: "서십자각터",
  bgKey: "bg_seosipjagak",
  bgPath: "assets/bg/bg_seosipjagak.webp",
  bgAlpha: 0.30,
  question: "빈칸에 들어갈 것으로 알맞은 것은?",
  problemImgKey: "q01_main",
  problemImgPath: "assets/q01/q01_main.png",
  choices: [
    { id: "A", text: "가", sideImgKey: "optA", sideImgPath: "assets/q01/optA.png" },
    { id: "B", text: "나", sideImgKey: "optB", sideImgPath: "assets/q01/optB.png" },
    { id: "C", text: "다", sideImgKey: "optC", sideImgPath: "assets/q01/optC.png" },
    { id: "D", text: "라", sideImgKey: "optD", sideImgPath: "assets/q01/optD.png" }
  ],
  correctId: "C",
  hints: { h1: "없음! 잘 생각해보자" },
  infoTitle: "그거 아시나요?",
  infoTextCorrectPath: "assets/q01/info.txt",
  infoTextWrongPath:   "assets/q01/info_wrong.txt"
});

// Q02: 드래그(광화문)
game.scene.add("Q02", new TypeDragScene("Q02"), false, {
  num2:"02", place:"광화문",
  bgKey:"bg_seosipjagak", bgPath:"assets/bg/bg_seosipjagak.webp",
  question:"주작·현무·기린 키를 알맞은 문에 배치하라.",
  slots:[{id:"L",x:320,y:1500,r:56},{id:"C",x:540,y:1500,r:56},{id:"R",x:760,y:1500,r:56}],
  pieces:[
    {id:"phoenix",imgKey:"optA",imgPath:"assets/q01/optA.png",start:{x:260,y:1750},displayW:120,displayH:120},
    {id:"turtle", imgKey:"optB",imgPath:"assets/q01/optB.png",start:{x:540,y:1750},displayW:120,displayH:120},
    {id:"qilin",  imgKey:"optC",imgPath:"assets/q01/optC.png",start:{x:820,y:1750},displayW:120,displayH:120}
  ],
  answerMap:{ phoenix:"C", turtle:"L", qilin:"R" },
  snapPx:36,
  hints:{ h1:"광화문 출입구 천장을 보라", h2:"세 문의 천장 문양이 다르다" },
  infoTitle: "그거 아시나요?",
  infoTextCorrectPath: "assets/q02/info.txt",
  infoTextWrongPath:   "assets/q02/info_wrong.txt"
});

// Q03: 드래그(흥례문 삼도)
game.scene.add("Q03", new TypeDragScene("Q03"), false, {
  num2:"03", place:"흥례문",
  bgKey:"bg_seosipjagak", bgPath:"assets/bg/bg_seosipjagak.webp",
  question:"“해 돋는 곳에는 문신, 달 뜨는 곳에는 무신. 가운데 길은 오직 왕.”\n예에 맞게 자리를 갖추라.",
  slots:[
    { id:"LEFT",   x:330, y:1480, r:64 },
    { id:"CENTER", x:540, y:1480, r:64 },
    { id:"RIGHT",  x:750, y:1480, r:64 },
  ],
  pieces:[
    { id:"KING", imgKey:"optA", imgPath:"assets/q01/optA.png", start:{x:240,y:1740}, displayW:120, displayH:120 }, // 왕
    { id:"MOON", imgKey:"optB", imgPath:"assets/q01/optB.png", start:{x:540,y:1740}, displayW:120, displayH:120 }, // 무신(월=서)
    { id:"SUN",  imgKey:"optC", imgPath:"assets/q01/optC.png", start:{x:840,y:1740}, displayW:120, displayH:120 }, // 문신(일=동)
  ],
  answerMap:{ KING:"CENTER", MOON:"LEFT", SUN:"RIGHT" },
  snapPx:36,
  hints:{ h1:"방위와 연결해 볼까?", h2:"해(日)=동, 달(月)=서" },
  infoTitle: "그거 아시나요?",
  infoTextCorrectPath: "assets/q03/info.txt",
  infoTextWrongPath:   "assets/q03/info_wrong.txt"
});

// Q06: 복합(드래그+입력) – 전용 씬
game.scene.add("Q06", new Q06_Sujungjeon("Q06"), false, {
  num2: "06",
  place: "수정전",
  bgKey: "bg_seosipjagak", bgPath:"assets/bg/bg_seosipjagak.webp",
  question: "책 3권을 옛→지금→개혁기 순으로 배치하고, 각 라벨을 눌러 연/시를 입력하라.",
  // 좌→우 슬롯 3개
  slots: [
    { id:"S1", x: 300, y: 1440, r: 64 },
    { id:"S2", x: 540, y: 1440, r: 64 },
    { id:"S3", x: 780, y: 1440, r: 64 },
  ],
  // 책 3권
  pieces: [
    { id:"JIPHYEON", label:"집현전",   imgKey:"optA", imgPath:"assets/q01/optA.png", start:{x: 300, y: 1740}, displayW:140, displayH:140 },
    { id:"SUJUNG",   label:"수정전",   imgKey:"optB", imgPath:"assets/q01/optB.png", start:{x: 540, y: 1740}, displayW:140, displayH:140 },
    { id:"NAEGAK",   label:"내각 본부", imgKey:"optC", imgPath:"assets/q01/optC.png", start:{x: 780, y: 1740}, displayW:140, displayH:140 },
  ],
  // 정답 순서: 집현전 → 수정전 → 내각 본부
  answerMap: { JIPHYEON:"S1", SUJUNG:"S2", NAEGAK:"S3" },
  // 입력 정답
  answers: {
    JIPHYEON: "세종",
    SUJUNG:   "1867",
    NAEGAK:   "1894",
  },
  hints: { h1:"순서가 이상해잉", h2:"각 시기를 적어보자" },
  infoTitle: "그거 아시나요?",
  infoTextCorrectPath: "assets/q06/info.txt",
  infoTextWrongPath:   "assets/q06/info_wrong.txt",
});

// Q07: 숫자입력(경회루)
game.scene.add("Q07", new TypeNumberScene("Q07"), false, {
  num2:"07", place:"경회루",
  bgKey:"bg_seosipjagak", bgPath:"assets/bg/bg_seosipjagak.webp",
  question:"바깥 기둥(절기) · 마루칸(달) · 중심칸(천지인)의 수는?",
  inputMask:"__, __, _",
  acceptAnswers:["12,24,3","12 24 3","12-24-3","12·24·3"], // 구분자 무시, 숫자만 비교
  hints:{ h1:"바깥→안쪽 순서", h2:"24·12·3의 상징" },
  infoTitle:"그거 아시나요?",
  infoTextCorrectPath:"assets/q07/info.txt",
  infoTextWrongPath:"assets/q07/info_wrong.txt"
});

// Q08: 숫자입력(아미산 굴뚝)
game.scene.add("Q08", new TypeNumberScene("Q08"), false, {
  num2:"08", place:"아미산 굴뚝",
  bgKey:"bg_seosipjagak", bgPath:"assets/bg/bg_seosipjagak.webp",
  question:"아미산 굴뚝 4개 중 장수+부귀 문양이 모두 새겨진 굴뚝은 몇 번째인가?",
  inputMask:"_",
  answer:"4",
  hints:{ h1:"문양을 하나씩 살펴보자", h2:"십장생 vs 부귀 구분" },
  infoTitle:"그거 아시나요?",
  infoTextCorrectPath:"assets/q08/info.txt",
  infoTextWrongPath:"assets/q08/info_wrong.txt"
});

// Q09: 객관식(강녕전/교태전)
game.scene.add("Q09", new TypeMCQScene("Q09"), false, {
  num2:"09", place:"강녕전/교태전",
  bgKey:"bg_seosipjagak", bgPath:"assets/bg/bg_seosipjagak.webp",
  question:"화면에 한자 ? 日 首 思 福. 물음표에 들어갈 글자는?",
  choices:[
    { id:"A", text:"口" }, // 정답
    { id:"B", text:"場" },
    { id:"C", text:"二" },
    { id:"D", text:"追" }
  ],
  correctId:"A",
  hints:{ h1:"글자 안의 네모(ㅁ)를 세어보자", h2:"1→2→3→4→5" },
  infoTitle:"그거 아시나요?",
  infoTextCorrectPath:"assets/q09/info.txt",
  infoTextWrongPath:"assets/q09/info_wrong.txt"
});

// Q10: 숫자입력(소주방 우물)
game.scene.add("Q10", new TypeNumberScene("Q10"), false, {
  num2:"10", place:"소주방 우물",
  bgKey:"bg_seosipjagak", bgPath:"assets/bg/bg_seosipjagak.webp",
  question:"우물 전체 높이 4 m, 바가지 높이 0.2 m.\n우물 상면에서 바가지를 '완전히 잠궈' 가득 채우려면 밧줄 최소 길이는?",
  inputMask:"_._", // 4.2
  acceptAnswers:["4.2","4,2"],
  hints:{ h1:"상면→물면 거리 = 4 m", h2:"완전히 잠기려면 바가지 높이(0.2 m)를 더한다" },
  infoTitle:"그거 아시나요?",
  infoTextCorrectPath:"assets/q10/info.txt",
  infoTextWrongPath:"assets/q10/info_wrong.txt"
});

/** ───────── Dev 콘솔 헬퍼 ─────────
 * 콘솔에서:
 *   go('Q02')   // 드래그 템플릿 실행
 *   go('Q03')
 *   go('Q06')
 *   go('Q07')
 *   go('Q08')
 *   go('Q09')
 *   go('Q10')
 *   go('Q01')
 *   listScenes() // 등록된 씬 목록
 */
window.go = (name)=> game.scene.start(String(name));
window.listScenes = ()=> Object.keys(game.scene.keys);

// 기본 자동 시작 없음(검은 화면 정상). 필요 시 한 줄 켜서 확인:
// game.scene.start("Q02");
// game.scene.start("Q03");
// game.scene.start("Q06");
// game.scene.start("Q07");
// game.scene.start("Q08");
// game.scene.start("Q09");
// game.scene.start("Q10");
// game.scene.start("Q01");
