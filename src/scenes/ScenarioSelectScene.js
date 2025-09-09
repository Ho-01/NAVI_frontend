// ScenarioSelectScene.js
import Phaser from "phaser";

export default class ScenarioSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: "ScenarioSelectScene" });
  }

  preload() {
    this.load.image("scenario1", "assets/scenario1.png");
    this.load.image("lock", "assets/lock.png");
  }

  create() {
    const { width: W, height: H } = this.scale;
    const px = (p) => p * W, py = (p) => p * H, f = (p) => Math.round(W * p);

    this.cameras.main.setBackgroundColor("#fffaee");

    // ───────── 타이틀 ─────────
    this.add.text(px(0.5), py(0.055), "모험할 장소를 선택하세요", {
      fontSize: f(0.06),
      color: "#333",
    }).setOrigin(0.5);

    // ───────── 카드 레이아웃 ─────────
    const cardW = px(0.42), cardH = cardW * 1.45;
    const gapX = px(0.06), gapY = py(0.06);
    const left = (W - (cardW * 2 + gapX)) / 2, top = py(0.12);
    const corner = Math.max(16, W * 0.02);

    // ───────── 1번 카드 (언락) ─────────
    const c1 = this.add.container(left, top);

    const bg1 = this.add.graphics();
    bg1.fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c1.add(bg1);

    const img1 = this.add.image(cardW/2, cardH*0.48, "scenario1").setOrigin(0.5,1);
    img1.setScale(Math.min((cardW*0.82)/img1.width, (cardH*0.42)/img1.height));
    c1.add(img1);

    c1.add(this.add.text(cardW/2, cardH*0.50, "시나리오 1", {fontSize:f(0.06), color:"#333"}).setOrigin(0.5,0));
    c1.add(this.add.text(cardW/2, cardH*0.60, "경복궁:", {fontSize:f(0.04), color:"#333"}).setOrigin(0.5,0));
    c1.add(this.add.text(cardW/2, cardH*0.68, "사라진 빛의 비밀", {fontSize:f(0.04), color:"#333"}).setOrigin(0.5,0));

    const hit1 = this.add.rectangle(cardW/2, cardH/2, cardW, cardH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("PreloadScene"));
    c1.add(hit1);

    // ───────── 2번 카드 (락) ─────────
    const c2 = this.add.container(left + cardW + gapX, top);
    const bg2 = this.add.graphics();
    bg2.fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c2.add(bg2);

    const lock2 = this.add.image(cardW/2, cardH*0.33, "lock");
    lock2.setScale(Math.min((cardW*0.42)/lock2.width, (cardH*0.22)/lock2.height));
    c2.add(lock2);
    c2.add(this.add.text(cardW/2, cardH*0.58, "COMING\nSOON", {fontSize:f(0.075), color:"#4A4036", align:"center"}).setOrigin(0.5,0));

    // ───────── 3번 카드 (락) ─────────
    const c3 = this.add.container(left, top + cardH + gapY);
    const bg3 = this.add.graphics();
    bg3.fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c3.add(bg3);

    const lock3 = this.add.image(cardW/2, cardH*0.33, "lock");
    lock3.setScale(Math.min((cardW*0.42)/lock3.width, (cardH*0.22)/lock3.height));
    c3.add(lock3);
    c3.add(this.add.text(cardW/2, cardH*0.58, "COMING\nSOON", {fontSize:f(0.075), color:"#4A4036", align:"center"}).setOrigin(0.5,0));

    // ───────── 4번 카드 (락) ─────────
    const c4 = this.add.container(left + cardW + gapX, top + cardH + gapY);
    const bg4 = this.add.graphics();
    bg4.fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c4.add(bg4);

    const lock4 = this.add.image(cardW/2, cardH*0.33, "lock");
    lock4.setScale(Math.min((cardW*0.42)/lock4.width, (cardH*0.22)/lock4.height));
    c4.add(lock4);
    c4.add(this.add.text(cardW/2, cardH*0.58, "COMING\nSOON", {fontSize:f(0.075), color:"#4A4036", align:"center"}).setOrigin(0.5,0));
  }
}
