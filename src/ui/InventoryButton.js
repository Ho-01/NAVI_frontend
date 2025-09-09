import InventoryOverlay from "./InventoryOverlay.js";

/**
 * 왼쪽 하단 고정 인벤토리 버튼
 */
export default class InventoryButton {
  constructor(scene, opts = {}) {
    this.scene = scene;
    const { width: W, height: H } = scene.scale;

    const {
      xRatio = 0.10,  // 좌측 비율
      yRatio = 0.90,  // 하단 비율
      scale = 0.15,
      textureKey = "icon_인벤토리",
    } = opts;

    // 오버레이 준비
    if (!scene.inventoryOverlay) {
      scene.inventoryOverlay = new InventoryOverlay(scene);
    }

    // 버튼
    this.btn = scene.add.image(W * xRatio, H * yRatio, textureKey)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(9998)
      .setScale(scale)
      .setAlpha(1);

    this.btn.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      scene.inventoryOverlay.show();  // ← 보유분만 표시 
    });

    // 리사이즈 대응
    this._onResize = () => {
      const { width: nW, height: nH } = scene.scale;
      this.btn.setPosition(nW * xRatio, nH * yRatio);
    };
    scene.scale.on("resize", this._onResize);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  destroy() {
    if (!this.scene) return;
    this.scene.scale.off("resize", this._onResize);
    this.btn?.destroy();
    this.scene = null;
    this.btn = null;
  }
}
