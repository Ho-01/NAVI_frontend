// src/scenes/ScenarioSelectScene.js
import Phaser from "phaser";
import RunService from "../features/run/service.js";
import { fetchIntro, checkOpenToday } from "../features/korApi/tourapi.js";
import TouchEffect from "../ui/TouchEffect.js";

/* ===== 유틸: 월별 줄 선택 + 시간범위 파싱 + 상태 계산 ===== */
const _toMin = (h, m = 0) => (+h) * 60 + (+m || 0);
const _mm = n => String(n).padStart(2, "0");
const _fmt = min => `${_mm(Math.floor(min / 60))}:${_mm(min % 60)}`;

function pickLineForMonth(usetime, date = new Date()) {
  if (!usetime) return null;
  const txt = String(usetime)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .trim();
  const lines = txt.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const m = date.getMonth() + 1;
  for (const line of lines) {
    const g = line.match(/\[(\d{1,2})월(?:\s*[~\-]\s*(\d{1,2})월)?\]/);
    if (g) {
      const a = +g[1], b = g[2] ? +g[2] : a;
      const inRange = (a <= b) ? (m >= a && m <= b) : (m >= a || m <= b);
      if (inRange) return line;
    }
  }
  // 월 표기가 없는 일반 시간 줄
  return lines.find(l =>
    /(\d{1,2})(?::|시)?\d{0,2}.*?[~\-–].*?(\d{1,2})(?::|시)?\d{0,2}/.test(l)
  ) || null;
}

function parseRangeFromLine(line) {
  if (!line) return null;
  const t = line.replace(/\s+/g, "");
  const m = t.match(
    /(\d{1,2})(?::|시)?(\d{0,2})?(?:분)?\s*[~\-–]\s*(\d{1,2})(?::|시)?(\d{0,2})?(?:분)?/
  );
  if (!m) return null;
  const s = _toMin(m[1], m[2] || 0), e = _toMin(m[3], m[4] || 0);
  return e > s ? { start: s, end: e, line } : null;
}

function getOpenStatus(meta, now = new Date()) {
  const C = { OPEN: "#22c55e", LAST: "#f59e0b", CLOSE: "#ef4444", NA: "#9ca3af" };
  if (!meta) return { color: C.NA, label: "정보없음", time: "", line: "" };
  if (meta.openToday === false) return { color: C.CLOSE, label: "휴관", time: "", line: "" };

  const line = pickLineForMonth(meta.hours, now);
  const r = parseRangeFromLine(line);
  if (!r) return { color: C.NA, label: "정보없음", time: "", line: line || "" };

  const cur = now.getHours() * 60 + now.getMinutes();
  if (cur < r.start)   return { color: C.CLOSE, label: "영업전",   time: _fmt(r.start), line: r.line };
  if (cur >= r.end)    return { color: C.CLOSE, label: "마감",     time: _fmt(r.end),   line: r.line };
  if (cur >= r.end - 60) return { color: C.LAST, label: "마감 임박", time: _fmt(r.end),   line: r.line };
  return { color: C.OPEN, label: "영업중", time: _fmt(r.end), line: r.line };
}

/* ===== 폴백 (프록시 실패시) ===== */
const FALLBACK_HOURS = `[1월~2월] 09:00~17:00 (입장마감 16:00)
[3월~5월] 09:00~18:00 (입장마감 17:00)
[6월~8월] 09:00~18:30 (입장마감 17:30)
[9월~10월] 09:00~18:00 (입장마감 17:00)
[11월~12월] 09:00~17:00 (입장마감 16:00)`;
const FALLBACK_REST  = `매주 화요일`;

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

    TouchEffect.init(this); // 터치 이펙트

    // 타이틀
    this.add.text(px(0.5), py(0.055), "모험할 장소를 선택하세요", {
      fontSize: f(0.06), color: "#333"
    }).setOrigin(0.5);

    // 카드 레이아웃
    const cardW = px(0.42), cardH = cardW * 1.45;
    const gapX = px(0.06), gapY = py(0.06);
    const left = (W - (cardW * 2 + gapX)) / 2, top = py(0.12);
    const corner = Math.max(16, W * 0.02);

    // ───────── 1번 카드 : 경복궁 시나리오 GYEONBOKGUNG ─────────
    const c1 = this.add.container(left, top);

    const bg1 = this.add.graphics().fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c1.add(bg1);

    const img1 = this.add.image(cardW / 2, cardH * 0.48, "scenario1").setOrigin(0.5, 1);
    img1.setScale(Math.min((cardW * 0.82) / img1.width, (cardH * 0.42) / img1.height));
    c1.add(img1);

    c1.add(this.add.text(cardW / 2, cardH * 0.50, "시나리오 1", { fontSize: f(0.06), color: "#333" }).setOrigin(0.5, 0));
    c1.add(this.add.text(cardW / 2, cardH * 0.60, "경복궁",     { fontSize: f(0.042), color: "#333" }).setOrigin(0.5, 0));
    c1.add(this.add.text(cardW / 2, cardH * 0.68, "사라진 빛의 비밀", { fontSize: f(0.04), color: "#333" }).setOrigin(0.5, 0));

    // 상태 램프 + 상태 텍스트(이어하기 위)
    const lamp = this.add.circle(cardW - 18, 18, 10, 0x999999).setStrokeStyle(2, 0x000000, 0.15);
    c1.add(lamp);

    const statusText = this.add.text(cardW / 2, cardH * 0.84, "정보없음", {
      fontSize: f(0.04), color: "#9ca3af", fontStyle: "bold"
    }).setOrigin(0.5, 0);
    c1.add(statusText);

    // 최초: registry의 메타 적용
    const applyStatus = (meta) => {
      const s = getOpenStatus(meta);
      const colorInt = Phaser.Display.Color.HexStringToColor(s.color).color;
      lamp.setFillStyle(colorInt, 1);
      statusText.setText(s.time ? `${s.label} · ~${s.time}` : s.label).setColor(s.color);
      console.log("[palaceOpen]", meta, s);
    };
    let meta = this.game.registry.get("palaceOpen") || null;
    applyStatus(meta);

    // 이어하기/새게임 표시 및 클릭
    const hit1_새게임시작 = this.add.rectangle(cardW / 2, cardH / 2, cardW, cardH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        RunService.startNewGame("GYEONGBOKGUNG")
          .then(() => this.scene.start("PreloadScene"))
          .catch(err => {
            console.error("[ScenarioSelectScene] 새 게임 시작 실패:", err);
            this.scene.start("TitleScene");
          });
      })
      .setAlpha(0);

    const hit1_이어하기 = this.add
      .rectangle(cardW / 2, cardH / 2, cardW, cardH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("PreloadScene"))
      .setAlpha(0);

    RunService.getMyGame("GYEONGBOKGUNG")
      .then(res => {
        if (res === false) {
          c1.add(this.add.text(cardW / 2, cardH * 0.90, "새 게임 시작", { fontSize: f(0.05), color: "#ab0c0cff" }).setOrigin(0.5, 0));
          c1.add(hit1_새게임시작); hit1_새게임시작.setAlpha(1);
        } else {
          c1.add(this.add.text(cardW / 2, cardH * 0.90, "이어하기", { fontSize: f(0.05), color: "#0c7a0cff" }).setOrigin(0.5, 0));
          c1.add(hit1_이어하기); hit1_이어하기.setAlpha(1);
        }
      })
      .catch(err => {
        console.error("[ScenarioSelectScene] 시나리오1 기록 조회 실패:", err);
        c1.add(this.add.text(cardW / 2, cardH * 0.90, "ERROR", { fontSize: f(0.05), color: "#ab0c0cff" }).setOrigin(0.5, 0));
      });

    // API 호출 → 메타 갱신
    fetchIntro(126508, 12)
      .then(intro => {
        const { openToday } = checkOpenToday(intro.restText);
        meta = { openToday, hours: intro.hours, restText: intro.restText };
        this.game.registry.set("palaceOpen", meta);
        applyStatus(meta);
      })
      .catch(err => {
        console.warn("[TourAPI] 실패:", err);
        meta = { openToday: !/화요일/.test(FALLBACK_REST), hours: FALLBACK_HOURS, restText: FALLBACK_REST };
        this.game.registry.set("palaceOpen", meta);
        applyStatus(meta);
      });

    // ── 2~4번 카드(락) ──
    const c2 = this.add.container(left + cardW + gapX, top);
    const bg2 = this.add.graphics().fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c2.add(bg2);
    const lock2 = this.add.image(cardW / 2, cardH * 0.33, "lock");
    lock2.setScale(Math.min((cardW * 0.42) / lock2.width, (cardH * 0.22) / lock2.height));
    c2.add(lock2);
    c2.add(this.add.text(cardW / 2, cardH * 0.58, "COMING\nSOON", { fontSize: f(0.075), color: "#4A4036", align: "center" }).setOrigin(0.5, 0));

    const c3 = this.add.container(left, top + cardH + gapY);
    const bg3 = this.add.graphics().fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c3.add(bg3);
    const lock3 = this.add.image(cardW / 2, cardH * 0.33, "lock");
    lock3.setScale(Math.min((cardW * 0.42) / lock3.width, (cardH * 0.22) / lock3.height));
    c3.add(lock3);
    c3.add(this.add.text(cardW / 2, cardH * 0.58, "COMING\nSOON", { fontSize: f(0.075), color: "#4A4036", align: "center" }).setOrigin(0.5, 0));

    const c4 = this.add.container(left + cardW + gapX, top + cardH + gapY);
    const bg4 = this.add.graphics().fillStyle(0xe9dfc7, 1).fillRoundedRect(0, 0, cardW, cardH, corner);
    c4.add(bg4);
    const lock4 = this.add.image(cardW / 2, cardH * 0.33, "lock");
    lock4.setScale(Math.min((cardW * 0.42) / lock4.width, (cardH * 0.22) / lock4.height));
    c4.add(lock4);
    c4.add(this.add.text(cardW / 2, cardH * 0.58, "COMING\nSOON", { fontSize: f(0.075), color: "#4A4036", align: "center" }).setOrigin(0.5, 0));
  }
}
