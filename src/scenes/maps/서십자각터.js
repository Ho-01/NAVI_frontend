import Phaser, { Scene } from "phaser";

// 서십자각터 맵
export default class 서십자각터 extends Phaser.Scene {
  constructor() {
    super({ key: "서십자각터" });
  }

  create() {
    console.log("서십자각터 맵");
    const { width, height } = this.scale;
    this.bg = this.add.image(width*0.5, height*0.5, "bg_서십자각터").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));


    const 어둑시니_할아버지 = this.add.image(width*0.4, height*0.5, "어둑시니_할아버지").setOrigin(0.5).setScale(0.7);
    const 어둑시니_할아버지_interaction = this.add.image(width*0.4, height*0.5, "interaction").setOrigin(0.5).setScale(0.4).setAlpha(0);
    어둑시니_할아버지.setInteractive({ useHandCursor: true })
    .once("pointerdown", () => {
      어둑시니_할아버지.disableInteractive();
      어둑시니_할아버지_interaction.setAlpha(1);
      this.cameras.main.fadeOut(50, 0, 0, 0);
      setTimeout(() => {
        this.scene.start("DialogScene", { json: this.cache.json.get("dialog1"), returnScene: "광화문" });
      }, 100);
    });

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

    // 그릴거 다 그리고 페이드인
    this.cameras.main.fadeIn(50, 0, 0, 0);
  }
}
