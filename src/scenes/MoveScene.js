// src/scenes/MoveScene.js
import Phaser from "phaser";
import { getPOI } from "../kakao/mappoint";
import GourdOverlay from "../ui/GourdOverlay";
import TouchEffect from "../ui/TouchEffect";

// ───────── Kakao SDK 동적 로더 ─────────
function loadKakaoSdk(cb) {
  if (window.kakao && window.kakao.maps) return cb();
  const existing = document.getElementById("kakao-sdk");
  if (existing) {
    existing.addEventListener("load", () => kakao.maps.load(cb), { once: true });
    return;
  }
  const s = document.createElement("script");
  s.id = "kakao-sdk";
  s.async = true;
  s.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=680eaa32e342a35d38784a63cf126f8f&libraries=services&autoload=false";
  s.onload = () => kakao.maps.load(cb);
  document.head.appendChild(s);
}

// ───────── 카카오맵 오버레이 (DOM) ─────────
function showKakaoMapOverlay(lat, lng, level = 3) {
  loadKakaoSdk(() => {
    const wrap = document.getElementById("mapWrap");
    if (!wrap) return;
    wrap.style.display = "block";
    const map = new kakao.maps.Map(document.getElementById("kmap"), {
      center: new kakao.maps.LatLng(lat, lng), level,
    });
    new kakao.maps.Marker({ position: map.getCenter() }).setMap(map);
    const closer = document.getElementById("closeMap");
    if (closer) closer.onclick = () => { wrap.style.display = "none"; };
  });
}
function hideKakaoMapOverlay() {
  const wrap = document.getElementById("mapWrap");
  if (wrap) wrap.style.display = "none";
}

// ───────── HUD (호리병) DOM ─────────
function ensureGourdHUD() {
  let el = document.getElementById("gourdHUD");
  if (!el) {
    el = document.createElement("div");
    el.id = "gourdHUD";
    el.style.cssText = `
      position:fixed; right:12px; bottom:12px;
      width:64px; height:64px; z-index:10002; display:none; pointer-events:auto;
    `;
    const img = document.createElement("img");
    img.src = new URL("../../public/assets/icons/icon_호리병.png", import.meta.url).href; // 경로 확인
    img.alt = "호리병";
    img.style.cssText = "width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));";
    el.appendChild(img);
    document.body.appendChild(el);
  }
  return el;
}
function showGourdHUD(show = true) {
  const el = ensureGourdHUD();
  el.style.display = show ? "block" : "none";
}

// ───────── Inventory HUD (좌하단) DOM ─────────
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
function showInventoryHUD(show = true) {
  const el = ensureInventoryHUD();
  el.style.display = show ? "block" : "none";
}

// (선택) 카카오맵 앱 열기
function openKakaoMapApp(lat, lng, name = "목적지") {
  const scheme = `kakaomap://route?ep=${lat},${lng}&by=FOOT`;
  const web = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
  const t = Date.now();
  window.location.href = scheme;
  setTimeout(() => { if (Date.now() - t < 1200) window.location.href = web; }, 1000);
}

export default class MoveScene extends Phaser.Scene {
  constructor() { super("MoveScene"); }

  init(data) {
    const json = data.json ?? {};
    this.returnScene = data.returnScene;
    this.text = json.text ?? null;
    this.tips = json.tips ?? null;
    this.imageKey = json.imageKey ?? null;

    // 좌표 추가
    this.lat = json.lat 
    this.lng = json.lng 
    this.level = json.level ?? 3;

    this.nextScene = json.nextScene ?? null;
    this.nextParam = json.nextParam ?? null;
    this.name = json.name ?? "목적지";
  


  const poi = this.name ? getPOI(this.name.replace(" ", "")) : null;
    if (poi) {
      this.lat = poi.lat;
      this.lng = poi.lng;
      this.level = poi.level;
    } else {
      // fallback
      this.lat = json.lat 
      this.lng = json.lng 
      this.level = json.level ?? 3;
    }
  }

  create() {
    console.log("다음 : " + this.nextScene, this.nextParam + " return : " + this.returnScene);
    this.cameras.main.setBackgroundColor("#ffe9c8");
    TouchEffect.init(this); // 터치 이펙트
    const { width: W, height: H } = this.scale;

    // 호리병 오버레이 인스턴스 
    if (!this.gourdOverlay) this.gourdOverlay = new GourdOverlay(this);
    // HUD 표시 및 클릭 바인딩 
    showGourdHUD(true);
    const hud = ensureGourdHUD();
    if (hud._onClick) hud.removeEventListener("click", hud._onClick);
    hud._onClick = () => {
      if (this.sys?.settings?.status === Phaser.Scenes.RUNNING) this.gourdOverlay?.show();
    };
    hud.addEventListener("click", hud._onClick);

    showKakaoMapOverlay(this.lat, this.lng, this.level);
   this.add.text(W*0.5, H*0.55, this.text || `${this.name}로 이동해주세요`, {
    fontSize: W*0.05, color:"#000", wordWrap:{ width: W*0.82 }, align:"center",}).setOrigin(0.5);
    if (this.tips) this.add.text(W * 0.5, H * 0.18, this.tips, {}).setOrigin(0.5);
    this.add.text(W * 0.5, H * 0.70, "카카오맵 앱에서 길찾기", {})
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => openKakaoMapApp(lat, lng, name));
    this.add.text(W * 0.5, H * 0.80, "도착했어요!", {})
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => { hideKakaoMapOverlay(); /* 다음 씬 이동 */ });
    // 취소 버튼(확실히 보이도록 스타일/위치 고정)
    const cancelBtn = this.add.text(W * 0.5, H * 0.89, "이동 취소", {
      fontSize: W * 0.04, backgroundColor: "#f0c2c2", color: "#000", padding: { x: 50, y: 24 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        hideKakaoMapOverlay();
        this.scene.start(this.moveCancel || this.returnScene);
      });
    if (this.moveCancel === false) cancelBtn.setAlpha(0);

    // 텍스트/버튼
    this.add.text(W * 0.5, H * 0.12, this.text || `${name}로 이동해주세요`, {
      fontSize: W * 0.05, color: "#000", wordWrap: { width: W * 0.82 }, align: "center",
    }).setOrigin(0.5);

    if (this.tips) {
      this.add.text(W * 0.5, H * 0.18, this.tips, {
        fontSize: W * 0.03, color: "#444", wordWrap: { width: W * 0.85 }, align: "center",
      }).setOrigin(0.5);
    }

    this.add.text(W * 0.5, H * 0.70, "카카오맵 앱에서 길찾기", {
      fontSize: W * 0.04, backgroundColor: "#cfe8d6", color: "#000", padding: { x: 60, y: 30 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => openKakaoMapApp(this.lat, this.lng, this.name));

    this.add.text(W * 0.5, H * 0.80, "도착했어요!", {
      fontSize: W * 0.05, backgroundColor: "#87b4e8", color: "#000", padding: { x: 80, y: 40 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        hideKakaoMapOverlay();
        if (this.nextScene) {
          this.scene.start(this.nextScene, { json: this.cache.json.get(this.nextParam), returnScene: this.returnScene });
        } else {
          this.scene.start(this.returnScene);
        }
      });

    this.cameras.main.fadeIn(80, 0, 0, 0);

    // 종료 정리
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      hideKakaoMapOverlay();
      if (hud?._onClick) hud.removeEventListener("click", hud._onClick);
      showGourdHUD(false);
      showInventoryHUD(false);
      this.inventoryOverlay = null;
      this.gourdOverlay = null;
    });
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      hideKakaoMapOverlay();
      if (hud?._onClick) hud.removeEventListener("click", hud._onClick);
      showGourdHUD(false);
      showInventoryHUD(false);
      this.inventoryOverlay = null;
      this.gourdOverlay = null;
    });
  }
}
