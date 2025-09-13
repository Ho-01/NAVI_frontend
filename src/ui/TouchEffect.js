// touchEffect.js
export default class TouchEffect {
  static init(scene) {
    scene.input.on("pointerdown", (pointer) => {
      const fx = scene.add.image(pointer.x, pointer.y, "navi_full_touch")
        .setOrigin(0.5)
        .setScale(0.3)
        .setAlpha(0);

      // 트윈으로 나타났다 사라지게
      scene.tweens.add({
        targets: fx,
        alpha: { from: 1, to: 0 },
        scale: { from: 0.2, to: 0.2 },
        duration: 400,
        onComplete: () => fx.destroy()
      });
    });
  }
}
