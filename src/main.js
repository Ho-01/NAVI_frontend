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
import UsernameInputScene from "./scenes/UsernameInputScene";

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
  scene: [TitleScene, LoginScene, ScenarioSelectScene, UsernameInputScene,
    // 서십자각터, 광화문, 흥례문, 영제교, 근정문, 수정전, 수정전_지도획득후, 경회루, 아미산, 교태전, 강녕전, 생물방, 소주방, 근정전_dark,
    PreloadScene, ProblemScene, MoveScene, DialogScene, CutScene, TutorialScene]
};

new Phaser.Game(config);
