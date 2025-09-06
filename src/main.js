import Phaser from "phaser";
import TitleScene from "./scenes/TitleScene";
import LoginScene from "./scenes/LoginScene";
import ScenarioSelectScene from "./scenes/ScenarioSelectScene";
import PreloadScene from "./scenes/PreloadScene";
import MapScene from "./scenes/MapScene";
import ProblemScene from "./scenes/problems/ProblemScene";
import DialogScene from "./scenes/DialogScene";
import PatternPuzzleScene from "./scenes/PatternPuzzleScene";
import CutScene from "./scenes/CutScene";
import TutorialScene from "./scenes/TutorialScene";
import MoveScene from "./scenes/MoveScene";
import 서십자각터 from "./scenes/maps/서십자각터";
import 광화문 from "./scenes/maps/광화문";
import 광화문2 from "./scenes/maps/광화문2";
import 광화문3 from "./scenes/maps/광화문3";
import 광화문4 from "./scenes/maps/광화문4";
import 흥례문 from "./scenes/maps/흥례문";
import 영제교 from "./scenes/maps/영제교";

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
    서십자각터, 광화문, 광화문2, 광화문3, 광화문4, 흥례문, 영제교,
    PreloadScene, MapScene, ProblemScene, MoveScene, DialogScene, CutScene, TutorialScene, PatternPuzzleScene]
};

new Phaser.Game(config);
