import Phaser from "phaser";

export default class InventoryOverlay {
  constructor(scene) {
    this.scene = scene;
    const { width: W, height: H } = scene.scale;

    this.root = scene.add.container(0, 0).setDepth(9999).setScrollFactor(0).setVisible(false);

    const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    const panel = scene.add.image(W / 2, H / 2, "scroll").setOrigin(0.5);
    const tex = scene.textures.get("scroll")?.getSourceImage?.();
    if (tex) panel.setScale(Math.min((W * 0.85) / tex.width, (H * 0.75) / tex.height));

    const title = scene.add.text(W / 2, H * 0.22, "인벤토리", {
      fontSize: Math.round(W * 0.05), color: "#000", fontStyle: "bold",
    }).setOrigin(0.5);

    this.content = scene.add.container(0, 0);
    this.root.add([dim, panel, title, this.content]);

    const inv = scene.game.registry.get("inventory");
    inv?.events?.on("inventory:granted", () => {
      if (this.root?.visible) this.render(inv.items());
    });

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  destroy() { this.root?.destroy(true); this.root = null; this.content = null; }

  show() {
    const inv = this.scene.game.registry.get("inventory");
    const items = inv?.items?.() ?? [];       // ← 보유한 것만 
    this.render(items);
    this.root?.setVisible(true);
  }
  hide() { this.root?.setVisible(false); }

  render(items = []) {
    const s = this.scene; if (!this.content) return;
    const { width: W, height: H } = s.scale;
    this.content.removeAll(true);

    if (!items.length) {
      this.content.add(s.add.text(W / 2, H * 0.52, "보유한 아이템이 없습니다.", {
        fontSize: Math.round(W * 0.035), color: "#222",
      }).setOrigin(0.5));
      return;
    }

    const cols = 4, cellW = W * 0.18, cellH = H * 0.14;
    const startX = W / 2 - (cellW * (cols - 1)) / 2, startY = H * 0.32;

    items.forEach((key, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = startX + c * cellW, y = startY + r * cellH;

      const texKey = s.textures.exists(key) ? key :
        (s.textures.exists(`item_${key}`) ? `item_${key}` : null);

      if (texKey) {
        const img = s.add.image(x, y, texKey).setOrigin(0.5);
        const raw = s.textures.get(texKey)?.getSourceImage?.();
        if (raw) img.setScale(Math.min((cellW * 0.7) / raw.width, (cellH * 0.6) / raw.height));
        const label = s.add.text(x, y + cellH * 0.33, key, { fontSize: Math.round(W * 0.028), color: "#000" }).setOrigin(0.5);
        this.content.add([img, label]);
      } else {
        const box = s.add.rectangle(x, y, cellW * 0.7, cellH * 0.55, 0xffffff, 0.9).setStrokeStyle(2, 0x333333);
        const label = s.add.text(x, y, key, { fontSize: Math.round(W * 0.03), color: "#000" }).setOrigin(0.5);
        this.content.add([box, label]);
      }
    });
  }
}
