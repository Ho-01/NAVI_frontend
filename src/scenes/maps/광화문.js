import Phaser from "phaser";

export default class 광화문 extends Phaser.Scene {
  constructor() {
    super({ key: "광화문" });
  }

  create() {
    console.log("광화문 맵");
    const { width, height } = this.scale;
    this.bg = this.add.image(width*0.5, height*0.5, "bg_광화문").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));

    // 해태
    const 해태 = this.add.zone(width*0.05, height*0.4, width*0.4, height*0.2).setOrigin(0);
    const 해태_interaction = this.add.image(width*0.2, height*0.5, "interaction").setOrigin(0).setScale(0.4).setAlpha(0);
    해태.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        해태_interaction.setAlpha(1);
        this.cameras.main.fadeOut(50, 0, 0, 0);
        setTimeout(() => {
            this.scene.start("DialogScene", { json: this.cache.json.get("dialog3"), returnScene: "광화문2" });
        }, 100);
    });
    const debug = this.add.graphics().lineStyle(2, 0xff0000, 0.8);
    debug.strokeRect(해태.x, 해태.y, 해태.width, 해태.height);

    // 해태메뉴
    const 메뉴 = this.add.image(width*0.9, height*0.15, "scroll").setOrigin(0.5).setScale(0.1).setAlpha(0);
    const 해태아이콘 = this.add.image(width*0.9, height*0.05, "icon_해태").setOrigin(0.5).setScale(1.3)
    .setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        if(메뉴.alpha===0){
            메뉴.setAlpha(1);
        }else{
            메뉴.setAlpha(0);
        }
    });
    // 이동메뉴
    const 짚신 = this.add.image(width*0.9, height*0.9, "icon_짚신").setOrigin(0.5).setScale(0.8).setAlpha(0)
    .setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        
    });
  }
}