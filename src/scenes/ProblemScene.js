import Phaser from "phaser";

export default class ProblemScene extends Phaser.Scene {
  constructor() {
    super({ key: "ProblemScene" });
  }

  init(data) {
    const json = data.json;
    if (!json) {
      console.error("json undefined!", data);
      return;
    }
    this.num = json.num;
    if (json.nextScene) {
      this.nextScene = json.nextScene;
    }else{this.nextScene=null;}
    if(json.nextParam){
      this.nextParam = json.nextParam;
    }else{this.nextParam=null;}
  }

  create() {    
    console.log("[ProblemScene]: 문제 "+this.num);

    window.go(`Q${this.num}`);
  }
}
