// ui/RewardPopup.js
import Phaser from "phaser";

const NAME_MAP = {
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

export default class RewardPopup {
    constructor(scene, opts = {}) {
        this.scene = scene;
        this.queue = [];
        this.busy = false;
        this.nameMap = { ...NAME_MAP, ...opts.nameMap };

        // 부모 DOM
        const parent = scene.game.canvas?.parentElement || document.body;
        if (getComputedStyle(parent).position === "static") parent.style.position = "relative";

        // 컨테이너
        const el = document.createElement("div");
        el.className = "reward-toast";
        el.style.cssText = [
            "position:absolute", "left:50%","top:50%","bottom:auto","transform:translate(-50%,-50%)",
            "display:flex", "align-items:center", "gap:12px",
            "padding:12px 16px", "background:#f5d8a7", "border:2px solid #333",
            "border-radius:12px", "font-size:16px", "line-height:1.1",
            "opacity:0", "transition:opacity .18s, transform .18s",
            "pointer-events:auto", "z-index:9999", "user-select:none", "white-space:nowrap",
            "cursor:pointer"
        ].join(";");

        // 아이콘
        const { width: W, height: H } = scene.scale;
        const iconSize = Math.round(Math.min(W * 0.12, H * 0.12, 64));
        const icon = document.createElement("img");
        icon.style.cssText = [
            `width:${iconSize}px`, `height:${iconSize}px`,
            "object-fit:contain", "image-rendering:auto", "flex:0 0 auto", "display:none"
        ].join(";");

        // 텍스트
        const text = document.createElement("span");
        text.style.cssText = "flex:1 1 auto";

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
        this.textEl.textContent = `${name}${josa} ${verb}. (탭하여 닫기)`;

        // 아이콘 (Phaser 텍스처 → DOM <img> src)
        const tm = this.scene.textures;
        let src = null;
        if (tm.exists(key)) {
            try { src = tm.getBase64(key); } catch (_) { }
            if (!src) {
                const tex = tm.get(key);
                const img = tex?.getSourceImage?.(0) || tex?.source?.[0]?.image || null;
                if (img) {
                    if (img.currentSrc) src = img.currentSrc;
                    else if (img.src) src = img.src;
                    else if (img instanceof HTMLCanvasElement) {
                        try { src = img.toDataURL(); } catch (_) { }
                    }
                }
            }
        }
        if (src) {
            this.iconEl.src = src;
            this.iconEl.style.display = "inline-block";
        } else {
            this.iconEl.removeAttribute("src");
            this.iconEl.style.display = "none";
        }

        // 표시
        this.el.style.opacity = "1";
        this.el.style.transform = "translateX(-50%) translateY(-8px)";

        // 클릭/탭으로만 닫기
        const close = (ev) => {
            ev?.stopPropagation?.();
            this.el.removeEventListener("pointerdown", close);
            this.el.removeEventListener("click", close);
            this.el.style.opacity = "0";
            this.el.style.transform = "translateX(-50%) translateY(0)";
            setTimeout(() => done(), 180);
        };
        this.el.addEventListener("pointerdown", close, { passive: true });
        this.el.addEventListener("click", close, { passive: true });
    }
}
