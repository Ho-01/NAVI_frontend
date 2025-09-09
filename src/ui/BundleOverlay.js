// BundleOverlay.js (번들 오버레이: 호리병/지도/인벤토리 진입)
import Phaser from "phaser";



export default class BundleOverlay {
  constructor(scene, { onGourd, onMap, onInventory } = {}) {
    this.scene = scene;
    this.inv = scene.game.registry.get("inventory");
    const { width: W, height: H } = scene.scale;

    this.root = scene.add.container(0, 0).setDepth(9999).setScrollFactor(0).setVisible(false);

    // 배경 딤
    this.dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    // 패널
    this.panel = scene.add.image(W / 2, H / 2, "overlay_bundle").setOrigin(0.5).setAlpha(0);
    this.panel.setDisplaySize(W * 0.9, H * 0.6);

    this.root.add([this.dim, this.panel]);

    // 항목 설정
    const CFG = [
      { key: "icon_호리병", label: "호리병", cb: onGourd, unlocked: () => true },
      { key: "icon_지도",   label: "지도",   cb: onMap,   unlocked: have => have.includes("map") },
      { key: "icon_인벤토리",label: "보관함", cb: onInventory, unlocked: have => have.includes("box") },
    ];

    // 아이콘/텍스트 생성
    this.items = CFG.map(({ key, label, cb, unlocked }) => {
      const img = scene.add.image(0, 0, key)
        .setOrigin(0.5)
        .setAlpha(0)
        .setVisible(false)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => { this.hide(); cb && cb(); });

      const text = scene.add.text(0, 0, label, {
        fontSize: Math.round(W * 0.03), color: "#000"
      }).setOrigin(0.5, 0).setAlpha(0).setVisible(false);

      this.root.add([img, text]);
      return { img, text, unlocked };
    });

    // 씬 종료 시 정리
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  destroy() {
    this.root?.destroy(true); this.root = null;
    this.scene = null;
    this.items = null;
  }

  // 열 때 한 번만 보유 아이템 기준으로 버튼 노출/배치
  show() {
    const { width: W, height: H } = this.scene.scale;
    this.panel.setDisplaySize(W * 0.9, H * 0.6);

    const have = this.inv?.items?.() ?? [];

    // 노출 여부 결정
    this.items.forEach(({ img, text, unlocked }) => {
      const on = unlocked?.(have) ?? true;
      img.setVisible(on).setAlpha(on ? 1 : 0).setInteractive(on);
      text.setVisible(on).setAlpha(on ? 1 : 0);
    });

    // 배치
    this.layout();

    // 표시/트윈
    this.root.setVisible(true);
    this.scene.tweens.add({ targets: this.dim, alpha: 0.65, duration: 160, ease: "Quad.easeOut" });
    this.scene.tweens.add({ targets: this.panel, alpha: 1, duration: 180, ease: "Quad.easeOut" });
    const vis = this.items.filter(o => o.img.visible).flatMap(o => [o.img, o.text]);
    vis.forEach(t => t.setAlpha(0));
    this.scene.tweens.add({ targets: vis, alpha: 1, duration: 200, ease: "Quad.easeOut", delay: 100 });
  }

  hide() { this.root.setVisible(false); }

  layout() {
    const pw = this.panel.displayWidth;
    const ph = this.panel.displayHeight;

    // 아이콘 셀 크기
    const cell = Math.min(pw * 0.3, ph * 0.32);

    // 기준 위치
    const cx = this.panel.x, cy = this.panel.y;
    const topY = cy - ph * 0.18;
    const botY = cy + ph * 0.10;
    const leftX = cx - pw * 0.26;
    const rightX = cx + pw * 0.26;
    const midX = cx;

    const vis = this.items.filter(o => o.img.visible);

    // 앵커 계산(1~3개 대응)
    let anchors = [];
    if (vis.length <= 1) {
      anchors = [{ x: midX, y: cy - ph * 0.03 }];
    } else if (vis.length === 2) {
      anchors = [
        { x: leftX,  y: topY }, // 상단 좌
        { x: rightX, y: topY }, // 상단 우
      ];
    } else {
      anchors = [
        { x: leftX,  y: botY }, // 하단 좌
        { x: rightX, y: botY }, // 하단 우
        { x: midX,   y: topY }, // 상단 중앙
      ];
    }

    // 스케일/배치
    vis.forEach((o, i) => {
      const { img, text } = o;
      const src = this.scene.textures.get(img.texture.key)?.getSourceImage?.();
      if (src) img.setScale(Math.min(cell / src.width, cell / src.height));

      const a = anchors[Math.min(i, anchors.length - 1)];
      img.setPosition(a.x, a.y);
      text.setPosition(a.x, a.y + cell / 2 + 8);
    });
  }
}
