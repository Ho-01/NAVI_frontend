import Phaser from "phaser";
import TitleScene from "./scenes/TitleScene";
import LoginScene from "./scenes/LoginScene";
import ScenarioSelectScene from "./scenes/ScenarioSelectScene";
import MainScene from "./scenes/MainScene";
import MapScene from "./scenes/MapScene";
import DialogScene from "./scenes/DialogScene";
import PatternPuzzleScene from "./scenes/PatternPuzzleScene";
import CutScene from "./scenes/CutScene";
import TutorialScene from "./scenes/TutorialScene";
import MoveScene from "./scenes/MoveScene";
import 서십자각터 from "./scenes/maps/서십자각터";
import 광화문 from "./scenes/maps/광화문";
import 광화문2 from "./scenes/maps/광화문2";

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
    서십자각터, 광화문, 광화문2,
    MainScene, MapScene, MoveScene, DialogScene, CutScene, TutorialScene, PatternPuzzleScene]
};

new Phaser.Game(config);
