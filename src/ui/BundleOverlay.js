// BundleOverlay.js (큰 오버레이)
import Phaser from "phaser";

export default class BundleOverlay {
    constructor(scene, { onGourd, onMap, onInventory } = {}) {
        this.scene = scene;
        this.inv = scene.game.registry.get("inventory");
        const { width: W, height: H } = scene.scale;

        this.root = scene.add.container(0, 0).setDepth(9999).setScrollFactor(0).setVisible(false);

        // 딤
        this.dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65)
            .setAlpha(0).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.hide());

        // 패널 이미지(큰 사이즈)
        this.panel = scene.add.image(W / 2, H / 2, "overlay_bundle").setOrigin(0.5).setAlpha(0);
        const raw = scene.textures.get("overlay_bundle")?.getSourceImage?.();
        if (raw) this.panel.setScale(Math.min((W * 0.85) / raw.width, (H * 0.6) / raw.height)); // 크게

        this.root.add([this.dim, this.panel]);

        // 항목(숨김 방식)
        this.entries = [
            { key: "icon_호리병", cb: onGourd, unlocked: () => true },
            { key: "icon_지도", cb: onMap, unlocked: (have) => have.includes("map") },
            { key: "icon_인벤토리", cb: onInventory, unlocked: (have) => have.includes("box") },
        ];

        // 아이콘/라벨 생성
        this.items = this.entries.map(e => {
            const img = scene.add.image(0, 0, e.key).setOrigin(0.5).setAlpha(0).setVisible(false)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => { this.hide(); e.cb && e.cb(); });

            const text = scene.add.text(0, 0, e.label, {
                fontSize: Math.round(W * 0.03), color: "#000"
            }).setOrigin(0.5, 0).setAlpha(0).setVisible(false);

            this.root.add([img, text]);
            return { img, text, entry: e };
        });

        // 이벤트 핸들러 저장해두고 destroy 때 off
        this._onInvGranted = () => {
            if (!this.root) return;              // 널가드 
            if (!this.root.visible) return;
            this.updateLocks(); this.layout();
        };
        this.inv?.events?.on("inventory:granted", this._onInvGranted);

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
        scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
    }

    destroy() {
        this.inv?.events?.off("inventory:granted", this._onInvGranted);
        this._onInvGranted = null;
        this.root?.destroy(true); this.root = null;
    }

    updateLocks() {
        const have = this.inv?.items?.() ?? [];
        this.items.forEach(({ img, text, entry }) => {
            const on = entry.unlocked?.(have) ?? true;
            img.setVisible(on).setAlpha(on ? 1 : 0).setInteractive(on);
            text.setVisible(on).setAlpha(on ? 1 : 0);
        });
    }

    // BundleOverlay.js
    layout() {
        const { width: W, height: H } = this.scene.scale;
        const pw = this.panel.displayWidth;
        const ph = this.panel.displayHeight;

        // 아이콘 크기
        const cell = Math.min(pw * 0.3, ph * 0.32);

        // 패널 스케일 보정(혹시 창 크기 바뀐 경우)
        this.panel.setDisplaySize(W * 0.9, H * 0.6);

        const cx = this.panel.x, cy = this.panel.y;
        const topY = cy - ph * 0.18;
        const botY = cy + ph * 0.10;
        const leftX = cx - pw * 0.26;
        const rightX = cx + pw * 0.26;
        const midX = cx;

        const vis = this.items.filter(o => o.img.visible);

        let anchors = [];
        if (vis.length <= 1) {
            anchors = [{ x: midX, y: cy - ph * 0.03 }];
        } else if (vis.length === 2) {
            anchors = [
                { x: leftX, y: topY },   // ← 2개일 때는 기존 그대로(상단 좌/우)
                { x: rightX, y: topY },
            ];
        } else { // 3개: 하단 좌/우 + 상단 중앙
            anchors = [
                { x: leftX, y: botY },   // ↓ 하단
                { x: rightX, y: botY },   // ↓ 하단
                { x: midX, y: topY },   // ↑ 상단 중앙
            ];
        }

        vis.forEach((o, i) => {
            const { img, text } = o;

            // 스케일
            const src = this.scene.textures.get(img.texture.key)?.getSourceImage?.();
            if (src) img.setScale(Math.min(cell / src.width, cell / src.height));

            // 배치
            const a = anchors[Math.min(i, anchors.length - 1)];
            img.setPosition(a.x, a.y);
            text.setPosition(a.x, a.y + cell / 2 + 8);
        });
    }

    show() {
        this.updateLocks();
        this.layout();
        this.root.setVisible(true);

        // 페이드
        this.scene.tweens.add({ targets: this.dim, alpha: 0.65, duration: 160, ease: "Quad.easeOut" });
        this.scene.tweens.add({ targets: this.panel, alpha: 1, duration: 180, ease: "Quad.easeOut" });
        const vis = this.items.filter(o => o.img.visible).flatMap(o => [o.img, o.text]);
        vis.forEach(t => t.setAlpha(0));
        this.scene.tweens.add({ targets: vis, alpha: 1, duration: 200, ease: "Quad.easeOut", delay: 100 });
    }

    hide() { this.root.setVisible(false); }
}
