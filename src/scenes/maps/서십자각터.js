import Phaser, { Scene } from "phaser";

// 서십자각터 맵
export default class 서십자각터 extends Phaser.Scene {
  constructor() {
    super({ key: "서십자각터" });
  }

  create() {
    console.log("서십자각터 맵");
    const { width, height } = this.scale;
    this.bg = this.add.image(width*0.5, height*0.5, "bg_서십자각터_dark").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));

    // 맵 타이틀
    const mapTitle = this.add.image(width*0.3, height*0.07, "맵_타이틀").setOrigin(0.5).setScale(0.7).setAlpha(0);
    this.tweens.add({ targets: mapTitle, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });
    const mapTitleText = this.add.text(width*0.3, height*0.065, "서십자각터", { fontSize: width*0.05, color: "#333" }).setOrigin(0.5).setAlpha(0);
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
    const 광화문앞으로 = this.add.image(width*0.5, height*0.45, "icon_위쪽이동").setOrigin(0.5).setScale(0.4).setVisible(false);
    this.tweens.add({ targets: 광화문앞으로, alpha: { from: 0.1, to: 1 }, duration: 700, yoyo: true, repeat: -1, hold: 100, repeatDelay: 100, ease: "Quad.easeInOut" });
    const 이동화살표 = { 광화문앞으로 }

    짚신.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        if(광화문앞으로.visible===false){
            Object.values(이동화살표).forEach(icon => icon.setVisible(true));
        }else{
            Object.values(이동화살표).forEach(icon => icon.setVisible(false));
        }
    });
    광화문앞으로.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        this.scene.start("MoveScene", {json: this.cache.json.get("move_f서십자각터_t광화문"), returnScene: "광화문"});
    })

    // 그릴거 다 그리고 페이드인
    this.cameras.main.fadeIn(50, 0, 0, 0);
  }
}
