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

/* Kakao SDK */
function loadKakaoSdk(cb) {
  if (window.kakao?.maps) return cb();
  const ex = document.getElementById("kakao-sdk");
  if (ex) { ex.addEventListener("load", () => kakao.maps.load(cb), { once: true }); return; }
  const s = document.createElement("script");
  s.id = "kakao-sdk"; s.async = true;
  s.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=680eaa32e342a35d38784a63cf126f8f&libraries=services&autoload=false";
  s.onload = () => kakao.maps.load(cb);
  document.head.appendChild(s);
}

/* Kakao Map Overlay (DOM) */
function showKakaoMapOverlay(lat, lng, level = 3) {
  loadKakaoSdk(() => {
    const wrap = document.getElementById("mapWrap"); if (!wrap) return;
    wrap.style.display = "block";

    const W = window.innerWidth, H = window.innerHeight;
    const mvw = Math.min(W * 0.92, 360);
    const mvh = Math.min(Math.round(mvw * 1.05), Math.round(H * 0.26));
    Object.assign(wrap.style, {
      position: "fixed",
      left: "50%",
      top: "12px",
      transform: "translateX(-50%)",
      width: `${mvw}px`,
      height: `${mvh}px`,
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 10px 24px rgba(0,0,0,.28)",
      pointerEvents: "none",
      zIndex: "1000"
    });

    const mapEl = document.getElementById("kmap");
    if (mapEl) {
      Object.assign(mapEl.style, { width: "100%", height: "100%", pointerEvents: "auto" });
      const map = new kakao.maps.Map(mapEl, { center: new kakao.maps.LatLng(lat, lng), level });
      new kakao.maps.Marker({ position: map.getCenter() }).setMap(map);
    }

    const closer = document.getElementById("closeMap");
    if (closer) { closer.style.pointerEvents = "auto"; closer.onclick = () => { wrap.style.display = "none"; }; }
  });
}
function hideKakaoMapOverlay() { const wrap = document.getElementById("mapWrap"); if (wrap) wrap.style.display = "none"; }

/* Inventory HUD */
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

/* 외부 앱 열기 */
function openKakaoMapApp(lat, lng, name = "목적지") {
  const scheme = `kakaomap://route?ep=${lat},${lng}&by=FOOT`;
  const web = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
  const t = Date.now(); window.location.href = scheme;
  setTimeout(() => { if (Date.now() - t < 1200) window.location.href = web; }, 1000);
}

/* 위치 읽어오기 */
function parseFromPlace(imageKey) {
  if (!imageKey) return null;
  const m = imageKey.match(/^move_f(.+?)_t/);
  return m ? m[1] : null;
}

function addBackgroundByPlace(scene, fromPlace, mapHeight = 0) {
  if (!fromPlace) return;

  // 우선순위: bg_<장소> → bg_<장소>_dark → bg_<장소>_fire
  const candidates = [
    `bg_${fromPlace}`,
    `bg_${fromPlace}_dark`,
    `bg_${fromPlace}_fire`
  ].filter(k => scene.textures.exists(k));

  if (candidates.length === 0) return;

  const key = candidates[0];
  const { width: W, height: H } = scene.scale;
  const targetH = Math.max(0, H - mapHeight);

  // 배경 스프라이트
  const bg = scene.add.image(W / 2, mapHeight + targetH / 2, key).setDepth(0);

  // 원본 크기 얻어서 비율 유지 스케일
  const tex = scene.textures.get(key).getSourceImage();
  const bw = tex.width, bh = tex.height;
  const s = Math.max(W / bw, targetH / bh);
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
    fontFamily: "SkyblessingInje",
    fontSize: fontPx,        // 고정 폰트
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
    this.imageKey = json.imageKey ?? null;
    this.showInventoryBtn = !!json.showInventoryBtn;

    this.lat = json.lat; this.lng = json.lng; this.level = json.level ?? 3;
    this.nextScene = json.nextScene ?? null;
    this.nextParam = json.nextParam ?? null;
    this.name = json.name ?? "목적지";

    const poi = this.name ? getPOI(this.name.replace(" ", "")) : null;
    if (poi) { this.lat = poi.lat; this.lng = poi.lng; this.level = poi.level; }
  }

  create() {
    this.cameras.main.setBackgroundColor("#d7c3a5");
    TouchEffect.init(this);
    const { width: W, height: H } = this.scale;

    // 1) 지도 높이 + 여백 먼저 계산
    let mapHeight = 0;
    {
      const wrap = document.getElementById("mapWrap");
      if (wrap) {
        const rect = wrap.getBoundingClientRect();
        const GAP = Math.round(H * 0.10);
        mapHeight = (rect.height || Math.round(H * 0.26)) + GAP;
      }
    }

    // 2) 현재 위치(from) 추출 → 배경 깔기
    const fromPlace = parseFromPlace(this.imageKey);   // ex) "영제교"
    addBackgroundByPlace(this, fromPlace, mapHeight);

    // 3) 인벤토리 HUD (MoveScene에서는 DOM HUD 사용 안 함)
    if (this.showInventoryBtn) {
      if (!this.inventoryOverlay) this.inventoryOverlay = new InventoryOverlay(this);
      showInventoryHUD(false);
    } else {
      showInventoryHUD(false);
    }

    // 4) UI 컨테이너(배경 위로)
    const root = this.add.container(0, mapHeight).setDepth(10001);

    // 패널 크기/카드
    const panelW = Math.min(W * 0.72, 720);
    const panelH = Math.min(Math.max(320, Math.round(H * 0.48)), 1360);
    const cardKey = makeHanjiCard(this, "__hanji", panelW, panelH);

    const cardY = panelH / 2 + Math.round(H * 0.02);
    const card = this.add.image(W / 2, cardY, cardKey).setAlpha(0);
    root.add(card);

    // dim (카드 뒤)
    const dimPad = 24;
    const dim = this.add.rectangle(
      W / 2, cardY, panelW + dimPad * 2, panelH + dimPad * 2, 0x000000, 0.16
    ).setAlpha(0).setInteractive();
    root.addAt(dim, 0);

    // 제목
    const title = this.add.text(
      W / 2,
      card.y - panelH / 2 + 100,
      this.text || `${this.name}로 이동해 주세요`,
      {
        fontFamily: "SkyblessingInje",
        fontSize: Math.round(panelW * 0.08),
        color: "#2b2b2b",
        align: "center",
        wordWrap: { width: panelW * 0.86 }
      }
    ).setOrigin(0.5).setAlpha(0);
    root.add(title);


    let tip;
    if (this.tips) {
      tip = this.add.text(
        W / 2,
        title.y + Math.round(panelH * 0.12),   // 제목 바로 아래 여백
        this.tips,
        {
          fontFamily: "SkyblessingInje",
          fontSize: Math.max(14, Math.round(panelW * 0.07)), // 작은 글씨
          color: "#4a4a4a",
          align: "center",
          wordWrap: { width: panelW * 0.86 },
          lineSpacing: 4
        }
      ).setOrigin(0.5, 0).setAlpha(0);
      root.add(tip);
    }
    // === 패널 중앙 인벤토리 버튼 ===
    if (this.showInventoryBtn) {
      const centerX = W / 2;
      const centerY = cardY;

      const invSize = Math.min(72, Math.round(panelH * 0.16));


      const invBtn = this.add.image(centerX, centerY + 100, "icon_인벤토리")
        .setDisplaySize(invSize, invSize)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0)
        .setScale(0.5);

      // ✅ setDisplaySize 이후 실제 스케일 저장
      const baseScaleX = invBtn.scaleX;
      const baseScaleY = invBtn.scaleY;

      invBtn.on("pointerdown", () => invBtn.setScale(baseScaleX * 0.96, baseScaleY * 0.96));
      invBtn.on("pointerout", () => invBtn.setScale(baseScaleX, baseScaleY));
      invBtn.on("pointerup", () => {
        invBtn.setScale(baseScaleX, baseScaleY);
        this.inventoryOverlay?.show();
      });

      root.add([invBtn]);
      this.tweens.add({ targets: [invBtn], alpha: 1, duration: 240, delay: 180 });
    }

    // 버튼
    const btnW = Math.min(BTN_W, Math.round(panelW * 0.45));
    const btnH = Math.min(BTN_H, Math.round(panelH * 0.22));
    const btnY = card.y + panelH / 2 - (btnH / 2 + 22);
    const gapX = BTN_GAP_X;

    const [btnRoute, txtRoute] = addJoseonButton(
      this,
      W / 2 - (btnW / 2 + gapX), btnY, btnW, btnH,
      "카카오맵 길찾기",
      () => openKakaoMapApp(this.lat, this.lng, this.name),
      Math.min(BTN_FONT, Math.round(btnH * 0.36))
    );

    const [btnArrived, txtArrived] = addJoseonButton(
      this,
      W / 2 + (btnW / 2 + gapX), btnY, btnW, btnH,
      "도착",
      () => {
        hideKakaoMapOverlay();
        if (this.nextScene) {
          this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
        } else {
          this.scene.start(this.returnScene);
        }
      },
      Math.min(BTN_FONT, Math.round(btnH * 0.36))
    );

    // 트윈
    this.tweens.add({ targets: dim, alpha: 0.18, duration: 140, ease: "Quad.easeOut" });
    [btnRoute, txtRoute, btnArrived, txtArrived].forEach(n => { n.setAlpha(0); root.add(n); });

    this.tweens.add({ targets: card, alpha: 1, duration: 200, delay: 60 });
    this.tweens.add({ targets: title, alpha: 1, duration: 220, delay: 120 });
    this.tweens.add({ targets: title, alpha: 1, duration: 220, delay: 120 });
    if (tip) this.tweens.add({ targets: tip, alpha: 1, duration: 220, delay: 160 });
    this.tweens.add({ targets: [btnRoute, txtRoute], alpha: 1, duration: 240, delay: 180 });
    this.tweens.add({ targets: [btnArrived, txtArrived], alpha: 1, duration: 240, delay: 220 });

    this.cameras.main.fadeIn(120, 0, 0, 0);

    // 정리
    const cleanup = () => {
      hideKakaoMapOverlay();
      const invHud = document.getElementById("inventoryHUD");
      if (invHud?._onClick) invHud.removeEventListener("click", invHud._onClick);
      showInventoryHUD(false);
      this.inventoryOverlay = null;
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }
}
