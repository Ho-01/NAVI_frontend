import Phaser from "phaser";
import { getPOI } from "../kakao/mappoint";
import TouchEffect from "../ui/TouchEffect";
import InventoryOverlay from "../ui/InventoryOverlay";
import { getTipsFor } from "../data/tips";

/* ===== 레이아웃/스타일 ===== */
const PAD = 24;                // 카드 내부 패딩
const BTN_W = 350;
const BTN_H = 140;
const BTN_FONT = 55;
const BTN_GAP_X = 50;
const COLOR_ACCENT = 0xBE8928; // 상/하 띠 색상
const PANEL_COLOR = 0xEFE6D1;
const LABEL_PX = 75; // 원하는 크기

/* ===== 라디우스 ===== */
const PANEL_RADIUS = 40; // 카드
const BTN_RADIUS = 40;   // 버튼
const MAP_RADIUS = 20;   // 지도 컨테이너(패널보다 살짝 작게)

/* ===== 폰트(통일) ===== */
const FONT_FAMILY = "Pretendard, Pretendard-Regular, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

/* 문자열 유틸 */
const toKey = (s) => (s ?? "")
  .toString()
  .replace(/\s+/g, "")
  .replace(/[^\w가-힣_-]/g, "");

/* 텍스처 존재하는 첫 키 */
const pickFirstTexture = (scene, keys) => keys.find(k => k && scene.textures.exists(k));

/* 버튼 틴트 */
function tintButton(btn, txt, { base, over, down, text = "#ffffff" }) {
  btn.setTint(base);
  txt.setColor(text);
  btn.on("pointerover", () => btn.setTint(over));
  btn.on("pointerout", () => btn.setTint(base));
  btn.on("pointerdown", () => btn.setTint(down));
  btn.on("pointerup", () => btn.setTint(over));
}

/* Inventory HUD (DOM) */
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
  ensureInventoryHUD().style.display = show ? "block" : "none";
}

/* 외부 앱 열기: 카카오맵 앱으로 길찾기 (목적지 핀 포함) */
function openKakaoMapApp(lat, lng, name = "목적지") {
  const scheme = `kakaomap://route?ep=${lat},${lng}&by=FOOT&apn=${encodeURIComponent(name)}`;
  window.location.href = scheme;
}

/* 위치 파싱 */
function parseFromPlace(imageKey) {
  if (!imageKey) return null;
  const m = imageKey.match(/^move_f(.+?)_t/);
  return m ? m[1] : null;
}
function parseToPlace(imageKey) {
  if (!imageKey) return null;
  const m = imageKey.match(/_t(.+?)$/);
  return m ? m[1] : null;
}

/* 배경 */
function addBackgroundByPlace(scene, fromPlace) {
  if (!fromPlace) return;
  const candidates = [
    `bg_${fromPlace}`,
    `bg_${fromPlace}_dark`,
    `bg_${fromPlace}_fire`,
  ].filter(k => scene.textures.exists(k));
  if (candidates.length === 0) return;

  const key = candidates[0];
  const { width: W, height: H } = scene.scale;
  const bg = scene.add.image(W / 2, H / 2, key).setDepth(0);
  const tex = scene.textures.get(key).getSourceImage();
  const s = Math.max(W / tex.width, H / tex.height);
  bg.setScale(s).setScrollFactor(0);
}

/* 카드 텍스처 */
function makeHanjiCard(scene, key, w, h) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(PANEL_COLOR, 0.98);
  g.fillRoundedRect(0, 0, w, h, PANEL_RADIUS);
  g.fillStyle(0x000000, 0.05);
  for (let i = 0; i < 160; i++)
    g.fillCircle(Math.random() * w, Math.random() * h, Math.random() * 1.2);
  // 거의 보이지 않는 외곽선(패널색)
  g.lineStyle(2, PANEL_COLOR, 1);
  g.strokeRoundedRect(-0.5, -0.5, w + 1, h + 1, PANEL_RADIUS + 1);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

/* 버튼 텍스처 */
function makeJoseonButton(scene, baseKey, w, h, radius = BTN_RADIUS) {
  const make = (k, fill, stroke) => {
    if (scene.textures.exists(k)) return;
    const g = scene.add.graphics();
    g.fillStyle(fill, 1).lineStyle(3, stroke, 1);
    g.fillRoundedRect(0, 0, w, h, radius);
    g.strokeRoundedRect(0, 0, w, h, radius);
    g.generateTexture(k, w, h);
    g.destroy();
  };
  make(`${baseKey}_base`, 0xe6d3b3, 0x5a3e1b);
  make(`${baseKey}_over`, 0xecdcbc, 0x5a3e1b);
  make(`${baseKey}_down`, 0xdccaa9, 0x3d2a12);
}
function addJoseonButton(scene, x, y, w, h, label, onClick, fontPx = 24, radius = BTN_RADIUS) {
  makeJoseonButton(scene, "__jbtn", w, h, radius);
  const btn = scene.add.image(x, y, "__jbtn_base")
    .setDisplaySize(w, h)
    .setInteractive({ useHandCursor: true });
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT_FAMILY,            // ✅ 통일
    fontSize: fontPx,
    color: "#2b2b2b"
  }).setOrigin(0.5);
  btn.on("pointerover", () => btn.setTexture("__jbtn_over"));
  btn.on("pointerout", () => btn.setTexture("__jbtn_base"));
  btn.on("pointerdown", () => { btn.setTexture("__jbtn_down"); btn.setScale(0.98); });
  btn.on("pointerup", () => { btn.setTexture("__jbtn_over"); btn.setScale(1); onClick && onClick(); });
  return [btn, txt];
}

/* ===== Scene ===== */
export default class MoveScene extends Phaser.Scene {
  constructor() { super("MoveScene"); }

  init(data) {
    const json = data.json ?? {};
    this.returnScene = data.returnScene;

    this.text = json.text ?? null;
    this.tips = json.tips ?? null;               // 문자열 또는 배열일 수 있음
    this.imageKey = json.imageKey ?? null;       // ex) move_f흥례문_t근정문
    this.showInventoryBtn = !!json.showInventoryBtn;

    this.lat = json.lat;
    this.lng = json.lng;
    this.level = json.level ?? 3;
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
    const toPlace = parseToPlace(this.imageKey) || this.name;
    addBackgroundByPlace(this, fromPlace, 0);



    // 인벤토리 HUD
    if (this.showInventoryBtn) {
      if (!this.inventoryOverlay) this.inventoryOverlay = new InventoryOverlay(this);
      showInventoryHUD(false);
    } else {
      showInventoryHUD(false);
    }

    // 루트 컨테이너
    const root = this.add.container(0, 0).setDepth(10001);

    // 카드
    const panelW = Math.min(W, 950);
    const panelH = Math.min(H, 2000);
    const cardKey = makeHanjiCard(this, "__hanji", panelW, panelH);
    const cardY = H / 2;

    const card = this.add.image(W / 2, cardY, cardKey).setAlpha(0);
    root.add(card);

    // ── 라운드 마스크 생성 ──
    const maskG = this.add.graphics();
    maskG.fillStyle(0xffffff, 1);
    maskG.fillRoundedRect(
      (W / 2) - panelW / 2,
      cardY - panelH / 2,
      panelW,
      panelH,
      PANEL_RADIUS
    );
    const panelMask = maskG.createGeometryMask();
    maskG.setVisible(false);

    // panel 컨테이너에 마스크 적용
    const panel = this.add.container(0, 0).setAlpha(0);
    panel.setMask(panelMask);
    root.add(panel);

    // 🔧 DIM: 화면 전체 덮기 (패널은 위에 두어 밝게 보이게)
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 1)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)  // 배경만 톤다운
      .setScrollFactor(0)
      .setAlpha(0)
      .setInteractive(); // 패널 밖 클릭 막기
    root.addAt(dim, 0); // bg 위, 패널 아래

    // 등장 트윈 (진하기 조절: 0.35~0.55 사이 권장)
    this.tweens.add({ targets: dim, alpha: 0.6, duration: 160, ease: "Quad.easeOut" });

    // 창 크기 변해도 꽉 차게
    this.scale.on("resize", ({ width, height }) => {
      dim.setSize(width, height);
      dim.setPosition(width / 2, height / 2);
    });

    // 상/하 띠
    const headerH = 180;
    const footerH = Math.max(96, Math.round(BTN_H * 1.4));
    const yTop = cardY - panelH / 2;
    const yBottom = cardY + panelH / 2;

    const header = this.add.graphics();
    header.fillStyle(COLOR_ACCENT, 1);
    header.fillRect((W / 2) - panelW / 2, yTop, panelW, headerH);

    const footer = this.add.graphics();
    footer.fillStyle(COLOR_ACCENT, 1);
    footer.fillRect((W / 2) - panelW / 2, yBottom - footerH, panelW, footerH);

    panel.add([header, footer]);

    const titleFont = Math.round(panelW * 0.08);
    const titleGroup = this.add.container(0, 0).setAlpha(1);

    const nameText = this.add.text(0, 0, this.name, {
      fontFamily: FONT_FAMILY,               // ✅ 통일
      fontSize: titleFont,
      color: "#4C0012",
      align: "center"
    }).setOrigin(0, 0.5);

    const tailText = this.add.text(0, 0, "으로 이동해 주세요", {
      fontFamily: FONT_FAMILY,               // ✅ 통일
      fontSize: titleFont,
      color: "#ffffff",
      align: "center"
    }).setOrigin(0, 0.5);

    tailText.x = nameText.displayWidth;
    const totalW = nameText.displayWidth + tailText.displayWidth;
    titleGroup.x = (W / 2) - (totalW / 2);
    titleGroup.y = yTop + headerH / 2; // 헤더 중앙
    titleGroup.add([nameText, tailText]);
    panel.add(titleGroup);

    /* 지도 */
    const fromKey = toKey(fromPlace);
    const destKey = this.destKey;

    const mapKey = pickFirstTexture(this, [
      `move_map_${fromKey}_${destKey}`,
      `move_map_${destKey}`,
      `move_map_${fromKey}`
    ]);

    const mapMax = 750;
    const mapW = Math.min(mapMax, Math.round((panelW - PAD * 2) * 0.9));
    const mapH = mapW;
    const mapY = (cardY - panelH / 2) + PAD + headerH + 16 + mapH / 2;

    // 지도 배경(라운드)
    const mapBg = this.add.graphics();
    mapBg.fillStyle(0xffffff, 1);
    mapBg.fillRoundedRect((W / 2) - mapW / 2, mapY - mapH / 2, mapW, mapH, Math.min(MAP_RADIUS, PANEL_RADIUS - 8));
    panel.add(mapBg);

    let mapImg;
    if (mapKey) {
      mapImg = this.add.image(W / 2, mapY + 50, mapKey).setDisplaySize(mapW, mapH);
      panel.add(mapImg);
      // 지도 라운드 마스크
      const m = this.add.graphics();
      m.fillStyle(0xffffff, 1);
      m.fillRoundedRect((W / 2) - mapW / 2, mapY - mapH / 2, mapW, mapH, Math.min(MAP_RADIUS, PANEL_RADIUS - 8));
      mapImg.setMask(m.createGeometryMask());
    }

    /* 설명(Tips): 저장소 + 3초 로테이션 */
    let tipTextObj = null;

    const incomingTips =
      Array.isArray(this.tips) ? this.tips
        : (typeof this.tips === "string" && this.tips.trim() ? [this.tips.trim()] : null);

    const tipsArr = incomingTips ?? getTipsFor({
      from: (fromPlace ?? "").replace(/\s/g, ""),
      to: (toPlace ?? "").replace(/\s/g, "")
    });

    let tipIndex = 0;
    if (tipsArr && tipsArr.length > 0) {
      tipTextObj = this.add.text(W / 2, mapY + mapH / 2 + 150, tipsArr[0], {
        fontFamily: FONT_FAMILY,                 // ✅ 통일
        fontSize: Math.max(16, Math.round(panelW * 0.051)),
        color: "#000000",
        align: "center",
        wordWrap: { width: Math.round(panelW * 0.82) },
        lineSpacing: 6
      }).setOrigin(0.5, 0).setAlpha(0);
      panel.add(tipTextObj);

      // 페이드 인
      this.tweens.add({ targets: tipTextObj, alpha: 1, duration: 220, delay: 160 });

      // 3초마다 로테이션
      this.tipTimer = this.time.addEvent({
        delay: 3000,
        loop: true,
        callback: () => {
          tipIndex = (tipIndex + 1) % tipsArr.length;
          this.tweens.add({
            targets: tipTextObj,
            alpha: 0,
            duration: 140,
            onComplete: () => {
              tipTextObj.setText(tipsArr[tipIndex]);
              this.tweens.add({ targets: tipTextObj, alpha: 1, duration: 140 });
            }
          });
        }
      });
    }

    /* 인벤토리 버튼(옵션) */
    if (this.showInventoryBtn) {
      const invSize = Math.min(72, Math.round(panelH * 0.16));
      const invBtn = this.add.image(W / 2, cardY + 500, "icon_인벤토리")
        .setDisplaySize(invSize, invSize)
        .setInteractive({ useHandCursor: true })
        .setScale(0.5);
      const baseX = invBtn.scaleX, baseY = invBtn.scaleY;
      invBtn.on("pointerdown", () => invBtn.setScale(baseX * 0.96, baseY * 0.96));
      invBtn.on("pointerout", () => invBtn.setScale(baseX, baseY));
      invBtn.on("pointerup", () => { invBtn.setScale(baseX, baseY); this.inventoryOverlay?.show(); });
      panel.add(invBtn);
    }

    /* 하단 버튼 */
    const btnWv = Math.min(BTN_W, Math.round(panelW * 0.45));
    const btnHv = Math.min(BTN_H, Math.round(panelH * 0.22));
    const btnY = cardY + panelH / 2 - PAD - (btnHv / 2 + 6);

    const [btnRoute, txtRoute] = addJoseonButton(
      this,
      W / 2 - (btnWv / 2 + BTN_GAP_X), btnY, btnWv, btnHv,
      "길찾기",
      () => openKakaoMapApp(this.lat, this.lng, this.name),
      LABEL_PX                                    // ✅ 고정 폰트
    );

    const [btnArrived, txtArrived] = addJoseonButton(
      this,
      W / 2 + (btnWv / 2 + BTN_GAP_X), btnY, btnWv, btnHv,
      "도착",
      () => {
        if (this.nextScene) {
          this.scene.start(this.nextScene, {
            json: this.cache.json.get(this.nextParam),
            returnScene: this.returnScene
          });
        } else {
          this.scene.start(this.returnScene);
        }
      },
      LABEL_PX                                    // ✅ 고정 폰트
    );
    tintButton(btnRoute, txtRoute, { base: 0x603D00, over: 0x72470A, down: 0x4A2C00, text: "#ffffff" });
    tintButton(btnArrived, txtArrived, { base: 0xFF006A, over: 0xE0005E, down: 0xB8004B, text: "#ffffff" });
    [btnRoute, txtRoute, btnArrived, txtArrived].forEach(n => panel.add(n));

    /* 트윈 */
    this.tweens.add({ targets: dim, alpha: 0.18, duration: 140, ease: "Quad.easeOut" });
    this.tweens.add({ targets: card, alpha: 1, duration: 200, delay: 60 });
    this.tweens.add({ targets: panel, alpha: 1, duration: 220, delay: 80 });
    this.cameras.main.fadeIn(120, 0, 0, 0);

    /* 정리 */
    const cleanup = () => {
      if (this.tipTimer) { this.tipTimer.remove(false); this.tipTimer = null; }
      const invHud = document.getElementById("inventoryHUD");
      if (invHud?._onClick) invHud.removeEventListener("click", invHud._onClick);
      showInventoryHUD(false);
      this.inventoryOverlay = null;
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    // 앱 전환 복귀 처리
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (this.scene.isPaused("MoveScene")) this.scene.resume("MoveScene");
      }
    }, { once: true });
  }
}
