import Phaser from "phaser";

export default class 광화문3 extends Phaser.Scene {
  constructor() {
    super({ key: "광화문3" });
  }

  create() {
    console.log("광화문3 맵");
    const { width, height } = this.scale;
    this.bg = this.add.image(width*0.5, height*0.5, "bg_광화문").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));

    const 광화문자물쇠 = this.add.image(width*0.9, height*0.6, "광화문자물쇠").setOrigin(0.5).setScale(0.3);
    const 광화문자물쇠_interaction = this.add.image(width*0.9, height*0.6, "interaction").setOrigin(0.5).setScale(0.4).setAlpha(0);
    광화문자물쇠.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        광화문자물쇠_interaction.setAlpha(1);
        this.cameras.main.fadeOut(50, 0, 0, 0);
        setTimeout(() => {
            this.scene.start("DialogScene", { json: this.cache.json.get("dialog6"), returnScene: "광화문4" });
        }, 100);
    });

    // 해태메뉴
    const 메뉴배경 = this.add.image(width*0.9, height*0.15, "scroll").setOrigin(0.5).setScale(0.1).setAlpha(0);
    const 지도아이콘 = this.add.image(width*0.9, height*0.1, "icon_지도").setOrigin(0.5).setScale(0.15).setAlpha(0);
    const 해태아이콘 = this.add.image(width*0.9, height*0.05, "icon_해태").setOrigin(0.5).setScale(1.3);
    this.드롭다운메뉴 = {메뉴배경, 지도아이콘}

    해태아이콘.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        if(메뉴배경.alpha===0){
            Object.values(this.드롭다운메뉴).forEach(icon => icon.setAlpha(1));
        }else{
            Object.values(this.드롭다운메뉴).forEach(icon => icon.setAlpha(0));
        }
    });
    지도아이콘.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        this.showMapOverlay("map");
    });

    // 지도 오버레이 초기화(처음 1회)
    this.initMapOverlay();

    this.cameras.main.fadeIn(50, 0, 0, 0);
  }

  initMapOverlay() {
    const { width, height } = this.scale;

    // 컨테이너
    const overlay = this.add.container(0, 0).setDepth(9999).setScrollFactor(0).setVisible(false);
    // 입력 차단용 반투명 bg
    const bg = this.add.rectangle(width*0.5, height*0.5, width, height, 0x000000, 0.65).setAlpha(0)
    .setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        overlay.setVisible(false);
        bg.setAlpha(0); mapImg.setAlpha(0);
    });
    // 지도 이미지
    const mapImg = this.add.image(width*0.5, height*0.5, "__dummy__").setAlpha(0).setScrollFactor(0);
    overlay.add([bg, mapImg]);
    this._overlay = { bg, mapImg, overlay}
  }
  showMapOverlay(textureKey){
    const { width, height } = this.scale;
    const { bg, mapImg, overlay} = this._overlay;

    mapImg.setTexture(textureKey);

    // 표시 + 페이드인
    overlay.setVisible(true);
    bg.setAlpha(0); mapImg.setAlpha(0);
    this.tweens.add({ targets: bg,  alpha: 0.65, duration: 150, ease: "Quad.easeOut" });
    this.tweens.add({ targets: mapImg, alpha: 1.0,  duration: 180, ease: "Quad.easeOut" });
  }
}