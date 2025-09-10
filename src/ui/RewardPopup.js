// ui/RewardPopup.js
import Phaser from "phaser";

const NAME_MAP = {
  // 새 키
  item_백호: "백호의 어패",
  item_주작: "주작의 어패",
  item_청룡: "청룡의 어패",
  item_현무: "현무의 어패",
  ghost_잡귀: "잡귀",
  ghost_아귀: "아귀",
  ghost_어둑시니: "어둑시니",
  // (선택) 과거 저장분 대비 하위호환
  item_1: "백호의 어패",
  item_2: "주작의 어패",
  item_3: "청룡의 어패",
  item_4: "현무의 어패",
  ghost_1: "어둑시니",
  ghost_2: "슬픔의 영혼",
  ghost_3: "분노의 영혼",
  ghost_4: "절망의 영혼",
  ghost_5: "진실의 영혼",
};

const TEX_ALIAS = {
  item_1: "item_백호",
  item_2: "item_주작",
  item_3: "item_청룡",
  item_4: "item_현무",
};

export default class RewardPopup {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.queue = [];
    this.busy = false;
    this.nameMap = { ...NAME_MAP, ...(opts.nameMap || {}) };
    this.texAlias = { ...TEX_ALIAS, ...(opts.texAlias || {}) };
    this.autoHideMs = opts.autoHideMs ?? 1000; // 기본 1초

    // ====== 지도/상자 팝업 제외 ======
    const userIgnore = opts.ignoreList || ["map", "bundle", "box", "chest", "지도", "상자"];
    this._shouldIgnore = (k) => {
      const key = String(k || "");
      if (/^(map|bundle|box|chest|지도|상자)(_|$)/i.test(key)) return true;
      if (userIgnore.some((p) => key === p || key.startsWith(`${p}_`))) return true;
      const nm = this.nameMap[key] || "";
      if (/(지도|상자)/.test(nm)) return true;
      try {
        const tex = this.scene.textures.exists(key) ? this.scene.textures.get(key) : null;
        const src = tex?.getSourceImage?.(0)?.src || "";
        if (/(\/|^)(map|bundle|box|chest|지도|상자)/i.test(src)) return true;
      } catch { }
      return false;
    };

    // ====== DOM 팝업(UI) ======
    const parent = scene.game.canvas?.parentElement || document.body;
    if (getComputedStyle(parent).position === "static") parent.style.position = "relative";

    const el = document.createElement("div");
    el.style.cssText = [
      "position:absolute",
      "left:50%",
      "top:50%",
      "transform:translate(-50%,-50%)",
      "display:flex",
      "align-items:center",
      "gap:12px",
      "padding:14px 18px",
      "background:#fff",
      "border:2px solid #333",
      "border-radius:14px",
      "font-size:16px",
      "line-height:1.15",
      "opacity:0",
      "transition:opacity .18s, transform .18s",
      "pointer-events:none",
      "z-index:9999",
      "user-select:none",
      "white-space:nowrap",
      "cursor:pointer",
      "box-shadow:0 6px 18px rgba(0,0,0,.2)",
    ].join(";");

    const { width: W, height: H } = scene.scale;
    const iconSize = Math.round(Math.min(W * 0.12, H * 0.12, 64));
    const icon = document.createElement("img");
    icon.style.cssText = [
      `width:${iconSize}px`,
      `height:${iconSize}px`,
      "object-fit:contain",
      "image-rendering:auto",
      "flex:0 0 auto",
      "display:none",
    ].join(";");

    const text = document.createElement("span");
    text.style.cssText = "flex:1 1 auto;color:#000";

    el.append(icon, text);
    parent.appendChild(el);

    this.el = el;
    this.iconEl = icon;
    this.textEl = text;

    // 이벤트 구독
    const onGrant = (k) => this.enqueue(k);
    this._onGrant = onGrant;
    const reg = scene.game.registry;
    reg.get("inventory")?.events?.on("inventory:granted", onGrant);
    reg.get("gourd")?.events?.on("inventory:granted", onGrant);

    // 파괴 시 정리
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  destroy() {
    const reg = this.scene.game.registry;
    reg.get("inventory")?.events?.off("inventory:granted", this._onGrant);
    reg.get("gourd")?.events?.off("inventory:granted", this._onGrant);
    this.el?.remove();
    this.el = this.iconEl = this.textEl = null;
  }

  enqueue(key) {
    if (this._shouldIgnore?.(key)) return;
    this.queue.push(key);
    if (!this.busy) this._dequeue();
  }

  _dequeue() {
    const k = this.queue.shift();
    if (!k) { this.busy = false; return; }
    this.busy = true;
    this._showOnce(k, () => this._dequeue());
  }

  _showOnce(key, done) {
    if (!this.el) { done(); return; }

    // 문구
    const name = this.nameMap[key] || key;
    const josa = /[가-힣]$/.test(name) && ((name.charCodeAt(name.length - 1) - 44032) % 28) ? "을" : "를";
    const verb = String(key).startsWith("ghost_") ? "붙잡았습니다" : "획득했습니다";
    this.textEl.textContent = `${name}${josa} ${verb}`;

    // --- 아이콘 설정(내구성 강화) ---
    const tm = this.scene.textures;
    const aliasKey = this.texAlias?.[key];
    const useKey = tm.exists(key) ? key : (aliasKey || key);

    let src = null;
    if (tm.exists(useKey)) {
      // 1) base64 우선 시도 (동일 오리진이면 100% 성공)
      try { src = tm.getBase64(useKey); } catch { }

      // 2) 실패하면 원본 image 엘리먼트에서 URL 뽑기
      if (!src) {
        try {
          const tex = tm.get(useKey);
          let img = tex?.getSourceImage?.() || tex?.getSourceImage?.(0) || tex?.source?.[0]?.image || null;
          if (img) src = img.currentSrc || img.src || null;
        } catch { }
      }
    }

    if (src) {
      this.iconEl.src = src;
      this.iconEl.style.display = "inline-block";
    } else {
      this.iconEl.removeAttribute("src");
      this.iconEl.style.display = "none";
      console.warn("[RewardPopup] 이미지 못 읽음", { key, aliasKey, useKey, exists: tm.exists(useKey) });
    }
    // 표시(중앙 고정)
    this.el.style.opacity = "1";
    this.el.style.transform = "translate(-50%,-50%)";
    this.el.style.pointerEvents = "auto";

    let closed = false;
    let timer = null;

    const close = (ev) => {
      if (closed) return;
      closed = true;
      if (timer) { clearTimeout(timer); timer = null; }
      ev?.stopPropagation?.();
      this.el.removeEventListener("pointerdown", close);
      this.el.removeEventListener("click", close);
      this.el.style.opacity = "0";
      this.el.style.transform = "translate(-50%,-50%)";
      this.el.style.pointerEvents = "none";
      setTimeout(() => done(), 180);
    };

    // 클릭/탭 닫기
    this.el.addEventListener("pointerdown", close, { passive: true });
    this.el.addEventListener("click", close, { passive: true });

    // 자동 닫기
    if ((this.autoHideMs ?? 0) > 0) {
      timer = setTimeout(() => close(), this.autoHideMs);
    }
  }
}
