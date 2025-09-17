// src/scenes/MoveScene.js
import Phaser from "phaser";
import { getPOI } from "../kakao/mappoint";
import TouchEffect from "../ui/TouchEffect";
import InventoryOverlay from "../ui/InventoryOverlay";

/* ===== 버튼 고정값 ===== */
const BTN_W = 400;      // px
const BTN_H = 150;      // px
const BTN_FONT = 55;    // px
const BTN_GAP_X = 20;   // px
const COLOR_ACCENT = 0xBE8928; // 상/하 띠 색상

function tintButton(btn, txt, { base, over, down, text = "#ffffff" }) {
  btn.setTint(base);
  txt.setColor(text);

  btn.on("pointerover", () => btn.setTint(over));
  btn.on("pointerout", () => btn.setTint(base));
  btn.on("pointerdown", () => btn.setTint(down));
  btn.on("pointerup", () => btn.setTint(over));
}

/* 유틸 */
const toKey = (s) => (s ?? "").toString().replace(/\s+/g, "").replace(/[^\w가-힣_-]/g, "");
const pickFirstTexture = (scene, keys) => keys.find(k => k && scene.textures.exists(k));

/* Inventory HUD (아이콘 DOM – 필요시만) */
function ensureInventoryHUD() {
  let el = document.getElementById("inventoryHUD");
  if (!el) {
    el = document.createElement("div");
    el.id = "inventoryHUD";
    el.style.cssText = `
      position:fixed; left:12px; bottom:12px;
      width:64px; height:64px; z-index:10002; display:none; pointer-events:auto;
    `;
    const img = document.createElement("img");
    img.src = new URL("../../public/assets/icons/icon_인벤토리.png", import.meta.url).href;
    img.alt = "인벤토리";
    img.style.cssText = "width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));";
    el.appendChild(img);
    document.body.appendChild(el);
  }
  return el;
}
function showInventoryHUD(show = true) { ensureInventoryHUD().style.display = show ? "block" : "none"; }

/* 외부 앱 열기: 카카오맵 앱으로 길찾기 (목적지 핀 포함) */
function openKakaoMapApp(lat, lng, name = "목적지") {
  const scheme = `kakaomap://route?ep=${lat},${lng}&by=FOOT&apn=${encodeURIComponent(name)}`;
  window.location.href = scheme;
}

/* 위치 읽어오기 */
function parseFromPlace(imageKey) {
  if (!imageKey) return null;
  const m = imageKey.match(/^move_f(.+?)_t/);
  return m ? m[1] : null;
}

/* 배경 */
function addBackgroundByPlace(scene, fromPlace) {
  if (!fromPlace) return;
  const candidates = [
    `bg_${fromPlace}`,
    `bg_${fromPlace}_dark`,
    `bg_${fromPlace}_fire`
  ].filter(k => scene.textures.exists(k));
  if (candidates.length === 0) return;

  const key = candidates[0];
  const { width: W, height: H } = scene.scale;
  const bg = scene.add.image(W / 2, H / 2, key).setDepth(0);
  const tex = scene.textures.get(key).getSourceImage();
  const s = Math.max(W / tex.width, H / tex.height);
  bg.setScale(s).setScrollFactor(0);
}

/* 텍스처 유틸 */
function makeHanjiCard(scene, key, w, h) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(0xefe6d1, 0.98); g.fillRoundedRect(0, 0, w, h, 18);
  g.fillStyle(0x000000, 0.05);
  for (let i = 0; i < 160; i++) g.fillCircle(Math.random() * w, Math.random() * h, Math.random() * 1.2);
  g.lineStyle(4, 0x2b2b2b, 1).strokeRoundedRect(2, 2, w - 4, h - 4, 16);
  g.generateTexture(key, w, h); g.destroy(); return key;
}
function makeJoseonButton(scene, baseKey, w, h) {
  const make = (k, fill, stroke) => {
    if (scene.textures.exists(k)) return;
    const g = scene.add.graphics();
    g.fillStyle(fill, 1).lineStyle(3, stroke, 1);
    g.fillRoundedRect(0, 0, w, h, h / 2);
    g.strokeRoundedRect(0, 0, w, h, h / 2);
    g.generateTexture(k, w, h); g.destroy();
  };
  make(`${baseKey}_base`, 0xe6d3b3, 0x5a3e1b);
  make(`${baseKey}_over`, 0xecdcbc, 0x5a3e1b);
  make(`${baseKey}_down`, 0xdccaa9, 0x3d2a12);
}
function addJoseonButton(scene, x, y, w, h, label, onClick, fontPx = 24) {
  makeJoseonButton(scene, "__jbtn", w, h);
  const btn = scene.add.image(x, y, "__jbtn_base").setDisplaySize(w, h).setInteractive({ useHandCursor: true });
  const txt = scene.add.text(x, y, label, {
    fontFamily: "Pretendard-Regular",
    fontSize: fontPx,
    color: "#2b2b2b"
  }).setOrigin(0.5);
  btn.on("pointerover", () => btn.setTexture("__jbtn_over"));
  btn.on("pointerout", () => btn.setTexture("__jbtn_base"));
  btn.on("pointerdown", () => { btn.setTexture("__jbtn_down"); btn.setScale(0.98); });
  btn.on("pointerup", () => { btn.setTexture("__jbtn_over"); btn.setScale(1); onClick && onClick(); });
  return [btn, txt];
}

/* Scene */
export default class MoveScene extends Phaser.Scene {
  constructor() { super("MoveScene"); }

  init(data) {
    const json = data.json ?? {};
    this.returnScene = data.returnScene;
    this.text = json.text ?? null;
    this.tips = json.tips ?? null;
    this.imageKey = json.imageKey ?? null;     // ex) move_f흥례문_t근정문
    this.showInventoryBtn = !!json.showInventoryBtn;

    this.lat = json.lat; this.lng = json.lng; this.level = json.level ?? 3;
    this.nextScene = json.nextScene ?? null;
    this.nextParam = json.nextParam ?? null;
    this.name = json.name ?? "목적지";

    const poi = this.name ? getPOI(this.name.replace(" ", "")) : null;
    if (poi) { this.lat = poi.lat; this.lng = poi.lng; this.level = poi.level; }

    // 목적지 텍스처 키(공백 제거)
    this.destKey = json.destKey ?? toKey(this.name);
  }

  create() {
    this.cameras.main.setBackgroundColor("#d7c3a5");
    TouchEffect.init(this);
    const { width: W, height: H } = this.scale;

    // 배경
    const fromPlace = parseFromPlace(this.imageKey);
    addBackgroundByPlace(this, fromPlace, 0);

    // 인벤토리 HUD 비활성
    if (this.showInventoryBtn) {
      if (!this.inventoryOverlay) this.inventoryOverlay = new InventoryOverlay(this);
      showInventoryHUD(false);
    } else {
      showInventoryHUD(false);
    }

    // UI 컨테이너
    const root = this.add.container(0, 0).setDepth(10001);

    // 패널 크기
    const panelW = Math.min(W, 900);
    const panelH = Math.min(H, 2000);
    const cardKey = makeHanjiCard(this, "__hanji", panelW, panelH);
    const cardY = H / 2;

    // dim
    const dimPad = 24;
    const dim = this.add.rectangle(
      W / 2, cardY, panelW + dimPad * 2, panelH + dimPad * 2, 0x000000, 0.16
    ).setAlpha(0).setInteractive();
    root.addAt(dim, 0);

    // 카드
    const card = this.add.image(W / 2, cardY, cardKey).setAlpha(0);
    root.add(card);

    // 상/하 띠
    const headerH = 230;
    const footerH = Math.max(96, Math.round(BTN_H * 1.4));
    const header = this.add.rectangle(W / 2, cardY - panelH / 2 + headerH / 2, panelW - 6, headerH, COLOR_ACCENT).setAlpha(0);
    const footer = this.add.rectangle(W / 2, cardY + panelH / 2 - footerH / 2, panelW - 6, footerH, COLOR_ACCENT).setAlpha(0);
    root.addAt(header, root.getIndex(card) + 1);
    root.addAt(footer, root.getIndex(card) + 1);

    // ───────── 제목 (이름만 #4C0012, 뒤 문구는 흰색, 줄바꿈 없음) ─────────
    const titleY = card.y - panelH / 2 + 100;
    const titleFont = Math.round(panelW * 0.08);
    const titleGroup = this.add.container(0, 0).setAlpha(0);

    const nameText = this.add.text(0, 0, this.name, {
      fontFamily: "Pretendard-Regular",
      fontSize: titleFont,
      color: "#4C0012",
      align: "center"
    }).setOrigin(0, 0.5);

    const tailText = this.add.text(0, 0, "로 이동해 주세요", {
      fontFamily: "Pretendard-Regular",
      fontSize: titleFont,
      color: "#ffffff",
      align: "center"
    }).setOrigin(0, 0.5);

    tailText.x = nameText.displayWidth;
    titleGroup.add([nameText, tailText]);

    const totalW = nameText.displayWidth + tailText.displayWidth;
    titleGroup.x = (W / 2) - (totalW / 2);
    titleGroup.y = titleY;
    root.add(titleGroup);

    /* === 지도(또는 맵 이미지) 선택/표시 === */
    const fromKey = toKey(fromPlace);
    const destKey = this.destKey;

    const mapKey = pickFirstTexture(this, [
      `move_map_${fromKey}_${destKey}`,
      `move_map_${destKey}`,
      `move_map_${fromKey}`
    ]);

    const mapMax = 700;
    const mapW = Math.min(mapMax, Math.round(panelW * 0.78));
    const mapH = mapW;
    const mapY = (cardY - panelH / 2) + headerH + 24 + mapH / 2;

    const mapBg = this.add.rectangle(W / 2, mapY, mapW + 16, mapH + 16, 0xffffff, 1)
      .setStrokeStyle(2, 0x2b2b2b, 0.6)
      .setAlpha(0);
    root.add(mapBg);

    let mapImg;
    if (mapKey) {
      mapImg = this.add.image(W / 2, mapY, mapKey).setDisplaySize(mapW, mapH).setAlpha(0);
      root.add(mapImg);
    }

    // tip (줄바꿈 허용, 검은색)
    let tip;
    if (this.tips) {
      tip = this.add.text(W / 2, mapY + mapH / 2 + 20, this.tips, {
        fontFamily: "Pretendard-Regular",
        fontSize: Math.max(16, Math.round(panelW * 0.045)),
        color: "#000000",
        align: "center",
        wordWrap: { width: Math.round(panelW * 0.82) },
        lineSpacing: 6
      }).setOrigin(0.5, 0).setAlpha(0);
      root.add(tip);
    }

    // 인벤토리 버튼 (옵션)
    if (this.showInventoryBtn) {
      const invSize = Math.min(72, Math.round(panelH * 0.16));
      const invBtn = this.add.image(W / 2, cardY + 100, "icon_인벤토리")
        .setDisplaySize(invSize, invSize)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0).setScale(0.5);
      const baseScaleX = invBtn.scaleX, baseScaleY = invBtn.scaleY;
      invBtn.on("pointerdown", () => invBtn.setScale(baseScaleX * 0.96, baseScaleY * 0.96));
      invBtn.on("pointerout", () => invBtn.setScale(baseScaleX, baseScaleY));
      invBtn.on("pointerup", () => { invBtn.setScale(baseScaleX, baseScaleY); this.inventoryOverlay?.show(); });
      root.add(invBtn);
      this.tweens.add({ targets: invBtn, alpha: 1, duration: 240, delay: 180 });
    }

    // 버튼
    const btnW = Math.min(BTN_W, Math.round(panelW * 0.45));
    const btnH = Math.min(BTN_H, Math.round(panelH * 0.22));
    const btnY = card.y + panelH / 2 - (btnH / 2 + 22);
    const gapX = BTN_GAP_X;

    const [btnRoute, txtRoute] = addJoseonButton(
      this,
      W / 2 - (btnW / 2 + gapX), btnY, btnW, btnH,
      "길찾기",
      () => openKakaoMapApp(this.lat, this.lng, this.name),
      Math.min(BTN_FONT, Math.round(btnH * 0.36))
    );

    const [btnArrived, txtArrived] = addJoseonButton(
      this,
      W / 2 + (btnW / 2 + gapX), btnY, btnW, btnH,
      "도착",
      () => {
        if (this.nextScene) {
          this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
        } else {
          this.scene.start(this.returnScene);
        }
      },
      Math.min(BTN_FONT, Math.round(btnH * 0.36))
    );

    // 색상/호버
    tintButton(btnRoute, txtRoute, { base: 0x603D00, over: 0x72470A, down: 0x4A2C00, text: "#ffffff" });
    tintButton(btnArrived, txtArrived, { base: 0xFF006A, over: 0xE0005E, down: 0xB8004B, text: "#ffffff" });

    // 트윈
    this.tweens.add({ targets: dim, alpha: 0.18, duration: 140, ease: "Quad.easeOut" });
    [btnRoute, txtRoute, btnArrived, txtArrived].forEach(n => { n.setAlpha(0); root.add(n); });

    this.tweens.add({ targets: card, alpha: 1, duration: 200, delay: 60 });
    this.tweens.add({ targets: [header, footer], alpha: 1, duration: 220, delay: 80 });
    this.tweens.add({ targets: titleGroup, alpha: 1, duration: 220, delay: 120 });
    this.tweens.add({ targets: [mapBg, mapImg].filter(Boolean), alpha: 1, duration: 220, delay: 100 });
    if (tip) this.tweens.add({ targets: tip, alpha: 1, duration: 220, delay: 160 });
    this.tweens.add({ targets: [btnRoute, txtRoute], alpha: 1, duration: 240, delay: 180 });
    this.tweens.add({ targets: [btnArrived, txtArrived], alpha: 1, duration: 240, delay: 220 });

    this.cameras.main.fadeIn(120, 0, 0, 0);

    // 정리
    const cleanup = () => {
      const invHud = document.getElementById("inventoryHUD");
      if (invHud?._onClick) invHud.removeEventListener("click", invHud._onClick);
      showInventoryHUD(false);
      this.inventoryOverlay = null;
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    // 카카오맵 갔다 돌아왔을 때(앱 전환) – 필요시 재개 처리
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (this.scene.isPaused("MoveScene")) this.scene.resume("MoveScene");
      }
    }, { once: true });
  }
}
