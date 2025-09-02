import Phaser from "phaser";

export default class 광화문2 extends Phaser.Scene {
  constructor() {
    super({ key: "광화문2" });
  }

  create() {
    console.log("광화문2 맵");
    const { width, height } = this.scale;
    this.bg = this.add.image(width*0.5, height*0.5, "bg_광화문").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));

    // 비겁귀
    const 비겁귀 = this.add.image(width*0.7, height*0.7, "비겁귀").setOrigin(0.5).setScale(0.9);
    const 비겁귀_interaction = this.add.image(width*0.7, height*0.7, "interaction").setOrigin(0.5).setScale(0.4).setAlpha(0);
    비겁귀.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        비겁귀_interaction.setAlpha(1);
        this.cameras.main.fadeOut(50, 0, 0, 0);
        setTimeout(() => {
            this.scene.start("DialogScene", { json: this.cache.json.get("dialog4"), returnScene: "광화문" });
        }, 100);
    });

    // 해태메뉴
    const 메뉴 = this.add.image(width*0.9, height*0.15, "scroll").setOrigin(0.5).setScale(0.1).setAlpha(0);
    const 해태아이콘 = this.add.image(width*0.9, height*0.05, "icon_해태").setOrigin(0.5).setScale(1.3);
    해태아이콘.setInteractive({useHandCursor: true})
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