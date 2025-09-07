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

    // 맵 타이틀
    const mapTitle = this.add.image(width*0.3, height*0.07, "맵_타이틀").setOrigin(0.5).setScale(0.7).setAlpha(0);
    this.tweens.add({ targets: mapTitle, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });
    const mapTitleText = this.add.text(width*0.3, height*0.065, "광화문", { fontSize: width*0.05, color: "#333" }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: mapTitleText, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });

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
    const 짚신 = this.add.image(width*0.9, height*0.9, "icon_짚신").setOrigin(0.5).setScale(0.8).setAlpha(1);
    const 흥례문으로 = this.add.image(width*0.9, height*0.7, "icon_위쪽이동").setOrigin(0.5).setScale(0.4).setVisible(false);
    this.tweens.add({ targets: 흥례문으로, alpha: { from: 0.1, to: 1 }, duration: 700, yoyo: true, repeat: -1, hold: 100, repeatDelay: 100, ease: "Quad.easeInOut" });
    const 이동화살표 = { 흥례문으로 }

    짚신.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        if(흥례문으로.visible===false){
            Object.values(이동화살표).forEach(icon => icon.setVisible(true));
        }else{
            Object.values(이동화살표).forEach(icon => icon.setVisible(false));
        }
    });
    흥례문으로.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        this.scene.start("DialogScene", {json: this.cache.json.get("dialog_광화문_3"), returnScene: "흥례문"});
    });

    this.cameras.main.fadeIn(50, 0, 0, 0);
  }
}