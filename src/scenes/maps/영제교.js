import Phaser from "phaser";
import GourdOverlay from "../../ui/GourdOverlay";


export default class 영제교 extends Phaser.Scene {
  constructor() {
    super({ key: "영제교" });
  }

  create() {
    console.log("영제교 맵");
    const { width, height } = this.scale;
    this.bg = this.add.image(width*0.5, height*0.5, "bg_영제교").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));

    // 호리병 오버레이
    this.gourdOverlay = new GourdOverlay(this);

    // 해태메뉴
    const 메뉴배경 = this.add.image(width*0.9, height*0.15, "scroll").setOrigin(0.5).setScale(0.1).setAlpha(0);
    const 호리병아이콘 = this.add.image(width*0.9, height*0.11, "icon_호리병").setOrigin(0.5).setScale(0.3).setAlpha(0);
    const 해태아이콘 = this.add.image(width*0.9, height*0.05, "icon_해태").setOrigin(0.5).setScale(1.3);
    this.드롭다운메뉴 = {메뉴배경, 호리병아이콘}

    해태아이콘.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        if(메뉴배경.alpha===0){
            Object.values(this.드롭다운메뉴).forEach(icon => icon.setAlpha(1));
        }else{
            Object.values(this.드롭다운메뉴).forEach(icon => icon.setAlpha(0));
        }
    });
    호리병아이콘.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        console.log("호리병 아이콘 클릭");
        this.gourdOverlay.show();
    });

    // 이동메뉴
    const 짚신 = this.add.image(width*0.9, height*0.9, "icon_짚신").setOrigin(0.5).setScale(0.8).setAlpha(1);
    const 근정문앞으로 = this.add.image(width*0.85, height*0.65, "icon_위쪽이동").setOrigin(0.5).setScale(0.4).setVisible(false);
    this.tweens.add({ targets: 근정문앞으로, alpha: { from: 0.1, to: 1 }, duration: 700, yoyo: true, repeat: -1, hold: 100, repeatDelay: 100, ease: "Quad.easeInOut" });
    const 이동화살표 = { 근정문앞으로 }

    짚신.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        if(근정문앞으로.visible===false){
            Object.values(이동화살표).forEach(icon => icon.setVisible(true));
        }else{
            Object.values(이동화살표).forEach(icon => icon.setVisible(false));
        }
    });
    근정문앞으로.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        this.scene.start("MoveScene", {json: this.cache.json.get("move_f영제교_t근정문"), returnScene: "근정문"});
    })
    
    this.cameras.main.fadeIn(50, 0, 0, 0); // 진입시 페이드인
  }
}