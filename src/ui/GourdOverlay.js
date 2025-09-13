import Phaser from "phaser";

export default class GourdOverlay {
  constructor(scene) {
    this.scene = scene;
    const { width: W, height: H } = scene.scale;

    // 컨테이너
    this.gourdOverlay = scene.add.container(0, 0).setDepth(9999).setScrollFactor(0).setVisible(false);

    // 입력 차단용 반투명 bg
    this.bg = scene.add.rectangle(W * 0.5, H * 0.5, W, H, 0x000000, 0.65).setAlpha(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.gourdOverlay.setVisible(false);
        this.bg.setAlpha(0); this.gourdImg.setAlpha(0); this.popupBg.setAlpha(0); this.popupText.setAlpha(0); this.emptyGourdText.setAlpha(0);
      });

    // 배경 이미지는 생성자에서 안전하게 한 번만 세팅 (show에서 setTexture 금지) 
    this.gourdImg = scene.add.image(W * 0.5, H * 0.5, "__DEFAULT").setAlpha(0).setScrollFactor(0).setScale(1.5);
    const texKey = scene.textures.exists("overlay_gourd") ? "overlay_gourd"
      : (scene.textures.exists("gourd_bg") ? "gourd_bg" : "__DEFAULT");
    this.gourdImg.setTexture(texKey);

    // 악귀1 : 잡귀
    this.ghost_잡귀 = scene.add.image(W * 0.2, H * 0.5, "잡귀").setOrigin(0.5).setScale(1).setAlpha(0)
      .setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.popupText.setText("잡귀: 강녕전에서 붙잡았습니다"); this.popupBg.setAlpha(1); this.popupText.setAlpha(1);
      });

    // 악귀2 : 아귀
    this.ghost_아귀 = scene.add.image(W * 0.8, H * 0.5, "아귀").setOrigin(0.5).setScale(1).setAlpha(0)
      .setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.popupText.setText("아귀: 생물방에서 붙잡았습니다"); this.popupBg.setAlpha(1); this.popupText.setAlpha(1);
      });

    // 악귀3 : 어둑시니
    this.ghost_어둑시니 = scene.add.image(W * 0.5, H * 0.3, "어둑시니").setOrigin(0.5).setScale(1).setAlpha(0)
      .setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.popupText.setText("어둑시니: 근정전에서 붙잡았습니다"); this.popupBg.setAlpha(1); this.popupText.setAlpha(1);
      });

    // // 악귀4
    // this.ghost_4 = scene.add.image(W*0.5, H*0.7, "ghost_4").setOrigin(0.5).setScale(0.3).setAlpha(0)
    // .setInteractive({useHandCursor: true}).on("pointerdown", () => {
    //     this.popupText.setText("악귀4: 악귀4입니다"); this.popupBg.setAlpha(1); this.popupText.setAlpha(1);
    // });

    // 악귀 없을 때 표시할 텍스트
    this.emptyGourdText = scene.add.text(W * 0.5, H * 0.5, "호리병이 비었습니다", {
      fontSize: Math.round(W * 0.04), color: "#fff", align: "center"
    }).setOrigin(0.5).setAlpha(0).setDepth(10001);

    // 악귀 설명 팝업 박스 + 텍스트
    this.popupBg = this.scene.add.rectangle(W / 2, H / 2, W * 0.7, H * 0.1, 0xfffaee, 0.95).setStrokeStyle(7, 0x333333).setDepth(10000).setAlpha(0);
    this.popupText = this.scene.add.text(W / 2, H / 2, "", {
      fontSize: Math.round(W * 0.045), color: "#000", wordWrap: { width: W * 0.65 }, align: "center"
    }).setOrigin(0.5).setDepth(10001).setAlpha(0);
    this.popupBg.setInteractive().on("pointerdown", () => { this.popupBg.setAlpha(0); this.popupText.setAlpha(0); });

    // 컨테이너에 모든 요소 넣어두기
    this.gourdOverlay.add([this.bg, this.gourdImg, this.ghost_잡귀, this.ghost_아귀, this.ghost_어둑시니, this.popupBg, this.popupText, this.emptyGourdText]);
  }


  show() {

    // 🔑 안전 가드: Scene Systems 상태로 체크 (RUNNING일 때만 동작) 
    const sys = this.scene?.sys;
    if (!sys || sys.settings?.status !== Phaser.Scenes.RUNNING) {
      console.warn("[GourdOverlay] show() skipped: scene not running");
      return;

    }




    // setTexture는 생성자에서만 실행. show에서는 가시성/트윈만.
    this.gourdOverlay.setVisible(true);
    this.bg.setAlpha(0); this.gourdImg.setAlpha(0); this.ghost_잡귀.setAlpha(0); this.ghost_아귀.setAlpha(0); this.ghost_어둑시니.setAlpha(0);

    // 저장소에서 보유중악귀 불러오기
    const gourd = this.scene.game.registry.get("gourd");
    const items = Array.isArray(gourd?.items?.()) ? gourd.items() : []; // 보유한 것만
    console.log("보유중 악귀:", items);
    // 존재하는 스프라이트만 타깃으로
    const 보유중악귀 = items.map(k => this[k]).filter(img => img && img.active && img.scene === this.scene);


    // 호리병 비었을 때 텍스트 표시
    if (보유중악귀.length === 0) { this.emptyGourdText.setAlpha(1); }
    // 보유중인 악귀들만 페이드인 효과
    this.scene.tweens.add({ targets: 보유중악귀, alpha: 1.0, duration: 300, ease: "Quad.easeOut", delay: 200 });
    // 배경+호리병 페이드인 효과
    this.scene.tweens.add({ targets: this.bg, alpha: 0.65, duration: 150, ease: "Quad.easeOut" });
    this.scene.tweens.add({ targets: this.gourdImg, alpha: 1.0, duration: 180, ease: "Quad.easeOut" });
  }
}