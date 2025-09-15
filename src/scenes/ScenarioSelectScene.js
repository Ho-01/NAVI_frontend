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
    this.load.image("완료스탬프", "assets/완료스탬프.png");
  }

  create() {
    const { width: W, height: H } = this.scale;
    const px = (p) => p * W, py = (p) => p * H, f = (p) => Math.round(W * p);

    this.cameras.main.setBackgroundColor("#fffaee");

    TouchEffect.init(this); // 터치 이펙트

    // 타이틀
    this.add.text(px(0.5), py(0.1), "시나리오 선택", {
      fontFamily: "Pretendard", fontStyle: "bold", fontSize: f(0.08), color: "#333"
    }).setOrigin(0.5);

    // 카드 레이아웃
    const cardW = px(0.9), cardH = cardW * 0.4;
    const corner = Math.max(16, W * 0.04);

    // ───────── 1번 카드 : 경복궁 시나리오 GYEONBOKGUNG ─────────
    const c1 = this.add.container(W*0.05, H*0.25);

    const bg1 = this.add.graphics().fillStyle(0xfffaeb, 1).fillRoundedRect(0, 0, cardW, cardH, corner).lineStyle(2,0xe9dfc7,1).strokeRoundedRect(0, 0, cardW, cardH, corner);
    c1.add(bg1);

    const img1 = this.add.image(cardW *0.95, cardH * 0.2, "scenario1").setOrigin(1, 0);
    img1.setScale(Math.min((cardW) / img1.width, (cardH*0.4) / img1.height));
    c1.add(img1);

    c1.add(this.add.text(cardW *0.05, cardH * 0.10, "[시나리오 1]", { fontFamily: "Pretendard", fontSize: f(0.04), color: "#565656ff" }).setOrigin(0, 0));
    c1.add(this.add.text(cardW *0.05, cardH * 0.30, "경복궁 : 사라진 빛의 비밀", { fontFamily: "Pretendard", fontStyle: "bold", fontSize: f(0.06), color: "#333" }).setOrigin(0, 0));

    // 상태 램프 + 상태 텍스트(이어하기 위)
    const lamp = this.add.circle(cardW - 18, 18, 10, 0x999999).setStrokeStyle(2, 0x000000, 0.15);
    c1.add(lamp);

    const statusText = this.add.text(cardW*0.05, cardH * 0.6, "정보없음", {
      fontFamily: "Pretendard", fontSize: f(0.04), color: "#9ca3af", fontStyle: "bold"
    }).setOrigin(0, 0);
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

    // =========== 이어하기/새게임 표시 및 클릭 ==========
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
          c1.add(this.add.text(cardW *0.95, cardH * 0.95, "새 게임 시작 >", { fontFamily: "SkyblessingInje", fontSize: f(0.05), color: "#4543dbff" }).setOrigin(1, 1));
          c1.add(hit1_새게임시작); hit1_새게임시작.setAlpha(1);
        } else {
          c1.add(this.add.text(cardW *0.95, cardH * 0.95, "이어하기 >", { fontFamily: "SkyblessingInje", fontSize: f(0.05), color: "#3c7a0cff" }).setOrigin(1, 1));
          c1.add(hit1_이어하기); hit1_이어하기.setAlpha(1);
        }
      })
      .catch(err => {
        console.error("[ScenarioSelectScene] 시나리오1 기록 조회 실패:", err);
        c1.add(this.add.text(cardW / 2, cardH * 0.90, "ERROR", { fontSize: f(0.05), color: "#ab0c0cff" }).setOrigin(0.5, 0));
      });
    
    // ========== 클리어도장 ==========
    const clearStamp1 = this.add.image(0, 0, "완료스탬프").setOrigin(0.5).setScale(0.6).setAlpha(0);
    const clearDate1 = this.add.text(0, cardH*0.3, "", { fontSize: f(0.06), color: "#d50012", fontStyle: "bold" }).setOrigin(0.5).setAlpha(0);
    const clearGroup1 = this.add.container(cardW*0.45, cardH/2, [clearStamp1, clearDate1]);
    clearGroup1.setAngle(-15); // -15도 기울이기

    RunService.getMyClearedGame("GYEONGBOKGUNG")
    .then(res => {
      if(res!=false){
        c1.add(clearGroup1);
        clearStamp1.setAlpha(1);
        clearDate1.setAlpha(1).setText(res);
      }
    }).catch(err => {
      console.error("[ScenarioSelectScene] 시나리오1 완료 기록 조회 실패:", err);
    })

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
    const c2 = this.add.container(W*0.05, H*0.45);
    const bg2 = this.add.graphics().fillStyle(0xfffaeb, 1).fillRoundedRect(0, 0, cardW, cardH, corner).lineStyle(2,0xe9dfc7,1).strokeRoundedRect(0, 0, cardW, cardH, corner);
    c2.add(bg2);
    const lock2 = this.add.image(cardW *0.9, cardH * 0.5, "lock").setOrigin(1, 0.5);
    lock2.setScale(Math.min((cardW) / lock2.width, (cardH*0.4) / lock2.height));
    c2.add(lock2);
    c2.add(this.add.text(cardW *0.1, cardH * 0.50, "Coming Soon...", { fontFamily: "Pretendard", fontStyle: "bold", fontSize: f(0.06), color: "#767676ff" }).setOrigin(0, 0.5));

    const c3 = this.add.container(W*0.05, H*0.65);
    const bg3 = this.add.graphics().fillStyle(0xfffaeb, 1).fillRoundedRect(0, 0, cardW, cardH, corner).lineStyle(2,0xe9dfc7,1).strokeRoundedRect(0, 0, cardW, cardH, corner);
    c3.add(bg3);
    const lock3 = this.add.image(cardW *0.9, cardH * 0.5, "lock").setOrigin(1, 0.5);
    lock3.setScale(Math.min((cardW) / lock3.width, (cardH*0.4) / lock3.height));
    c3.add(lock3);
    c3.add(this.add.text(cardW *0.1, cardH * 0.50, "Coming Soon...", { fontFamily: "Pretendard", fontStyle: "bold", fontSize: f(0.06), color: "#767676ff" }).setOrigin(0, 0.5));
  }
}
