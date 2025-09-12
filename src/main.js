import Phaser from "phaser";
import TitleScene from "./scenes/TitleScene";
import LoginScene from "./scenes/LoginScene";
import ScenarioSelectScene from "./scenes/ScenarioSelectScene";
import PreloadScene from "./scenes/PreloadScene";
import ProblemScene from "./scenes/problems/ProblemScene";
import DialogScene from "./scenes/DialogScene";
import CutScene from "./scenes/CutScene";
import TutorialScene from "./scenes/TutorialScene";
import MoveScene from "./scenes/MoveScene";
// import 서십자각터 from "./scenes/maps/서십자각터";
// import 광화문 from "./scenes/maps/광화문";
// import 흥례문 from "./scenes/maps/흥례문";
// import 영제교 from "./scenes/maps/영제교";
// import 근정문 from "./scenes/maps/근정문";
// import 수정전 from "./scenes/maps/수정전";
// import 수정전_지도획득후 from "./scenes/maps/수정전_지도획득후";
// import 경회루 from "./scenes/maps/경회루";
// import 아미산 from "./scenes/maps/아미산";
// import 교태전 from "./scenes/maps/교태전";
// import 강녕전 from "./scenes/maps/강녕전";
// import 생물방 from "./scenes/maps/생물방";
// import 소주방 from "./scenes/maps/소주방";
// import 근정전_dark from "./scenes/maps/근정전_dark";

const config = {
  type: Phaser.AUTO,
  width: 1080,    // 기준 가로
  height: 2160,  // 기준 세로
  backgroundColor: "#222",
  scale: {
    mode: Phaser.Scale.EXPAND,          // 화면 크기에 맞게 스케일 조정
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [TitleScene, LoginScene, ScenarioSelectScene, 
    // 서십자각터, 광화문, 흥례문, 영제교, 근정문, 수정전, 수정전_지도획득후, 경회루, 아미산, 교태전, 강녕전, 생물방, 소주방, 근정전_dark,
    PreloadScene, ProblemScene, MoveScene, DialogScene, CutScene, TutorialScene]
};

new Phaser.Game(config);
