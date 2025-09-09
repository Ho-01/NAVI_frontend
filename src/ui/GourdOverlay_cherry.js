import Phaser from "phaser";

export default class GourdOverlay_cherry {
  constructor(scene) {
    this.scene = scene;
    const { width: W, height: H } = scene.scale;

    this.root = scene.add.container(0, 0).setDepth(9999).setScrollFactor(0).setVisible(false);

    const dim = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.65)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    const panel = scene.add.image(W/2, H/2, "scroll").setOrigin(0.5);
    const tex = scene.textures.get("scroll")?.getSourceImage?.();
    if (tex) panel.setScale(Math.min((W*0.85)/tex.width, (H*0.75)/tex.height));

    const title = scene.add.text(W/2, H*0.22, "호리병(영혼 보관)", {
      fontSize: Math.round(W*0.05), color: "#000", fontStyle: "bold",
    }).setOrigin(0.5);

    this.content = scene.add.container(0, 0);
    this.root.add([dim, panel, title, this.content]);

    // 호리병 변경 시, 열려있다면 즉시 리렌더
    const gourd = scene.game.registry.get("gourd"); 
    gourd?.events?.on("inventory:granted", () => { 
      if (this.root?.visible) this.show(); 
    }); 
 
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY,  () => this.destroy());
  }

  destroy() { this.root?.destroy(true); this.root = null; this.content = null; }

  show() { 
    const gourd = this.scene.game.registry.get("gourd"); 
    const items = gourd?.items?.() ?? [];   // ← 보유한 것만 
    this._render(items); 
    this.root?.setVisible(true); 
  }
  hide() { this.root?.setVisible(false); }

  _render(keys = []) {
    if (!this.content) return;
    const s = this.scene;
    const { width: W, height: H } = s.scale;
    this.content.removeAll(true);

    if (!keys.length) {
      this.content.add(
        s.add.text(W/2, H*0.52, "보관된 영혼이 없습니다.", { fontSize: Math.round(W*0.035), color: "#222" }).setOrigin(0.5)
      );
      return;
    }

    const cols = 4, cellW = W*0.18, cellH = H*0.14;
    const startX = W/2 - (cellW*(cols-1))/2, startY = H*0.32;

    keys.forEach((key, i) => {
      const c = i % cols, r = Math.floor(i/cols);
      const x = startX + c*cellW, y = startY + r*cellH;

      const texKey = s.textures.exists(key) ? key : null; // ghost_*는 그대로 텍스처 키
      if (texKey) {
        const img = s.add.image(x, y, texKey).setOrigin(0.5);
         img.setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            this._showDesc(key);
          });
        const raw = s.textures.get(texKey)?.getSourceImage?.();
        if (raw) img.setScale(Math.min((cellW*0.7)/raw.width, (cellH*0.6)/raw.height));

        const label = s.add.text(x, y+cellH*0.33, key, { fontSize: Math.round(W*0.028), color: "#000" }).setOrigin(0.5);
        this.content.add([img, label]);
      } else {
        const box = s.add.rectangle(x, y, cellW*0.7, cellH*0.55, 0xffffff, 0.9).setStrokeStyle(2, 0x333333);
        const label = s.add.text(x, y, key, { fontSize: Math.round(W*0.03), color:"#000" }).setOrigin(0.5);
        this.content.add([box, label]);
      }
    });
  }
   _showDesc(key) {
   const { width: W, height: H } = this.scene.scale;
   // 설명 매핑
   const descMap = {
     ghost_1: "광화문에서 만난 첫 번째 유령",
     ghost_2: "슬픔에 잠긴 유령",
     ghost_3: "분노의 기운을 띤 유령",
     ghost_4: "희망을 잃은 유령",
     ghost_5: "진실을 알고 있는 유령",
   };
   const text = descMap[key] || "알 수 없는 영혼";

   // 팝업 박스 + 텍스트
   const bg = this.scene.add.rectangle(W/2, H/2, W*0.7, H*0.3, 0xffffff, 0.95)
     .setStrokeStyle(3, 0x333333)
     .setDepth(10000);
   const t = this.scene.add.text(W/2, H/2, text, {
     fontSize: Math.round(W*0.035), color:"#000", wordWrap:{width: W*0.65}, align:"center"
   }).setOrigin(0.5).setDepth(10001);

   // 클릭 시 닫기
   bg.setInteractive().on("pointerdown", () => { bg.destroy(); t.destroy(); });
 }
}
