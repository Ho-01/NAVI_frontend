import Phaser from "phaser";

export default class InventoryOverlay {
  constructor(scene) {
    this.scene = scene;
    const { width: W, height: H } = scene.scale;

    this.root = scene.add.container(0, 0).setDepth(9999).setScrollFactor(0).setVisible(false);

    const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    const panel = scene.add.image(W / 2, H / 2, "overlay_inventory").setOrigin(0.5);
    const tex = scene.textures.get("overlay_inventory")?.getSourceImage?.();
    if (tex) panel.setScale(Math.min((W * 0.85) / tex.width, (H * 0.75) / tex.height));

    const title = scene.add.text(W / 2, H * 0.22, {
      fontSize: Math.round(W * 0.05), color: "#000", fontStyle: "bold",
    }).setOrigin(0.5);

    this.content = scene.add.container(0, 0);
    this.root.add([dim, panel, title, this.content]);

    this._allow = (k) => /^item_/i.test(k) || /^ghost_/i.test(k);


    const inv = scene.game.registry.get("inventory");
    const onGranted = (k) => {
      if (!this.container || this.container.destroyed) return; // null/파괴 가드 
      // 자동 오픈 원치 않으면 visible 건드리지 말고 목록만 갱신 
      this.refresh && this.refresh();
    };
    inv?.events?.on("inventory:granted", onGranted);
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, () => {
      inv?.events?.off("inventory:granted", onGranted);
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  destroy() { this.root?.destroy(true); this.root = null; this.content = null; }

  show() {
    const inv = this.scene.game.registry.get("inventory");
    const items = (inv?.items?.() ?? []).filter(this._allow);       // ← 보유한 것만 
    this.render(items);
    this.root?.setVisible(true);
  }
  hide() { this.root?.setVisible(false); }

  render(items = []) {
    items = items.filter(this._allow);
    const s = this.scene; if (!this.content) return;
    const { width: W, height: H } = s.scale;
    this.content.removeAll(true);

    if (!items.length) {
      this.content.add(s.add.text(W / 2, H * 0.52, {
        fontSize: Math.round(W * 0.035), color: "#222",
      }).setOrigin(0.5));
      return;
    }

    const cols = 4, cellW = W * 0.18, cellH = H * 0.14;
    const startX = W / 2 - (cellW * (cols - 1)) / 2, startY = H * 0.55;

    items.forEach((key, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = startX + c * cellW, y = startY + r * cellH;

      const texKey = s.textures.exists(key) ? key :
        (s.textures.exists(`item_${key}`) ? `item_${key}` : null);

      if (texKey) {
        const img = s.add.image(x, y, texKey).setOrigin(0.5);
        const raw = s.textures.get(texKey)?.getSourceImage?.();
        if (raw) img.setScale(Math.min((cellW * 0.85) / raw.width, (cellH * 0.8) / raw.height));
        this.content.add([img]);
      } else {
        const box = s.add.rectangle(x, y, cellW * 0.7, cellH * 0.55, 0xffffff, 0.9).setStrokeStyle(2, 0x333333);
        this.content.add([box]);
      }
    });
  }
}
