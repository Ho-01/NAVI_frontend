import Phaser from "phaser";

export default class 아미산 extends Phaser.Scene {
  constructor() {
    super({ key: "아미산" });
  }

  create() {
    console.log("아미산 맵");
    const { width, height } = this.scale;
    this.bg = this.add.image(width*0.5, height*0.5, "bg_아미산").setOrigin(0.5).setDepth(-1);
    // 배경 이미지를 화면 비율 유지하면서 꽉 채우기
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));

    // 맵 타이틀
    const mapTitle = this.add.image(width*0.3, height*0.07, "맵_타이틀").setOrigin(0.5).setScale(0.7).setAlpha(0);
    this.tweens.add({ targets: mapTitle, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });
    const mapTitleText = this.add.text(width*0.3, height*0.065, "아미산", { fontSize: width*0.05, color: "#333" }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: mapTitleText, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });

    // 해태메뉴
    const 메뉴배경 = this.add.image(width*0.9, height*0.15, "scroll").setOrigin(0.5).setScale(0.1).setAlpha(0);
    const 호리병아이콘 = this.add.image(width*0.9, height*0.11, "icon_호리병").setOrigin(0.5).setScale(0.3).setAlpha(0);
    const 지도아이콘 = this.add.image(width*0.9, height*0.18, "icon_지도").setOrigin(0.5).setScale(0.15).setAlpha(0);
    const 해태아이콘 = this.add.image(width*0.9, height*0.05, "icon_해태").setOrigin(0.5).setScale(1.3);
    this.드롭다운메뉴 = {메뉴배경, 호리병아이콘, 지도아이콘}

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
    });
    지도아이콘.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        this.showMapOverlay("map");
    });

    // 이동메뉴
    const 짚신 = this.add.image(width*0.9, height*0.9, "icon_짚신").setOrigin(0.5).setScale(0.8).setAlpha(1);
    const 교태전으로 = this.add.image(width*0.50, height*0.90, "icon_아래쪽이동").setOrigin(0.5).setScale(0.4).setVisible(false);
    this.tweens.add({ targets: 교태전으로, alpha: { from: 0.1, to: 1 }, duration: 700, yoyo: true, repeat: -1, hold: 100, repeatDelay: 100, ease: "Quad.easeInOut" });
    const 이동화살표 = { 교태전으로 }

    짚신.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        if(교태전으로.visible===false){
            Object.values(이동화살표).forEach(icon => icon.setVisible(true));
        }else{
            Object.values(이동화살표).forEach(icon => icon.setVisible(false));
        }
    });
    교태전으로.setInteractive({useHandCursor: true})
    .on("pointerdown", () => {
        this.scene.start("교태전");
    });

    // 지도 오버레이 초기화(처음 1회)
    this.initMapOverlay();
    
    this.cameras.main.fadeIn(50, 0, 0, 0); // 진입시 페이드인
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