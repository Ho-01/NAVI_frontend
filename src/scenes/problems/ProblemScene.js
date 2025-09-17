import Phaser from "phaser";

export default class ProblemScene extends Phaser.Scene {
  constructor() {
    super({ key: "ProblemScene" });
  }

  init(data) {
    this.json = data.json;
    if (!this.json) {
      console.error("json undefined!", data);
      return;
    }
    this.num = this.json.num;
  }

  create() {    
    if(this.num=="01"||"04"||"07"||"08"||"09"){
      console.log("[ProblemScene]: TypeMCQScene "+this.num);
      this.scene.start("TypeMCQScene", {json: this.json});
    } else if(this.num=="02"||"03"||"05"){
      console.log("TypeDragScene");
    } else if(this.num=="06"){
      console.log("TypeNumberScene");
    }
    
    
    // const { width: W, height: H } = this.scale;
    // this.cameras.main.setBackgroundColor("#000000");    
    // // 터치/클릭 시 다음 씬으로 이동
    // this.input.once("pointerdown", () => {
    //   if (this.rewardItem) {
    //     this.rewardItem.split(",").map(s => s.trim()).forEach(item => {
    //       console.log("[ProblemScene] 보상 아이템 지급:", item);
    //       autoGrant(this, item);
    //     });
    //     // autoGrant(this, this.rewardItem, { onceId: `problem:${this.nextParam || this.title}` });
    //   }
    //   this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
    // });
  }
}
