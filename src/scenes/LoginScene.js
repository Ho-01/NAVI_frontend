// src/scenes/LoginScene.js
import Phaser from "phaser";
import AuthService from "../features/auth/service";
import appClient from "../core/appClient";
import TouchEffect from "../ui/TouchEffect";

// Google SDK 로더
function loadGoogleSdk() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoginScene" });
  }

  preload() {
    this.load.image("logo", "assets/logo.png");
    this.load.image("게스트버튼", "assets/게스트버튼.png");
    this.load.image("카카오버튼", "assets/카카오버튼.png");
    this.load.image("구글버튼", "assets/구글버튼.png");
  }

  create() {
    const { width: W, height: H } = this.scale;

    TouchEffect.init(this);
    this.cameras.main.fadeIn(30, 0, 0, 0);
    this.cameras.main.setBackgroundColor("#fffaee");

    const logo = this.add.image(W * 0.5, H * 0.2, "logo")
      .setDisplaySize(W * 0.4, W * 0.4).setOrigin(0.5);

    this.loading = this.add.text(W * 0.5, H * 0.5, "로그인 중...", {
      fontFamily: "SkyblessingInje", fontSize: Math.round(H * 0.04), color: "#333"
    }).setOrigin(0.5);

    this.btns = this.add.container().setVisible(false);

    const guestBtn = this.add.image(W * 0.5, H * 0.5, "게스트버튼")
      .setScale(2).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => { await this.handleGuest(); });

    const orBar = this.add.text(W * 0.5, H * 0.72, "============= 또는 =============", {
      fontSize: Math.round(H * 0.015), color: "#333"
    }).setOrigin(0.5);

    const kakaoBtn = this.add.image(W * 0.5, H * 0.8, "카카오버튼")
      .setScale(2).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => { await this.handleKakao(); });

    const googleBtn = this.add.image(W * 0.5, H * 0.9, "구글버튼")
      .setScale(2).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => { await this.handleGoogle(); });

    this.btns.add([guestBtn, orBar, kakaoBtn, googleBtn]);

    this.tryAutoFlow();
  }

  showLoading(on) { this.loading.setVisible(on); this.btns.setVisible(!on); }

  async tryAutoFlow() {
    this.showLoading(true);
    const hasRefresh = !!localStorage.getItem("refreshToken");
    console.log("[LoginScene] 자동 로그인 시도, 리프레시 토큰:", hasRefresh);

    if (hasRefresh) {
      const ok = await appClient.ensureRefreshed();
      console.log("[LoginScene] 리프레시 결과:", ok);
      if (ok) return this.scene.start("ScenarioSelectScene");
    }
    // 여기로 오면: 토큰 없음 or 리프레시 실패 → 버튼 노출
    this.showLoading(false);
  }

  async handleGuest() {
    this.showLoading(true);
    const { data, error } = await AuthService.startAsGuest();
    if (!error && data) return this.scene.start("ScenarioSelectScene");
    console.error("[LoginScene] 게스트 로그인 실패:", error);
    this.showLoading(false);
  }

  // ── 구글 로그인 ────────────────────────────────────
  async handleGoogle() {
    try {
      this.showLoading(true);
      await loadGoogleSdk();

      const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!CLIENT_ID) throw new Error("VITE_GOOGLE_CLIENT_ID 누락");

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        ux_mode: "popup",
        callback: async ({ credential }) => {
          try {
            if (!credential) throw new Error("ID 토큰 없음");
            const res = await AuthService.loginWithGoogle(credential);
            if (res?.data) return this.scene.start("ScenarioSelectScene");
            throw new Error(res?.error?.message || "구글 로그인 실패");
          } catch (e) {
            console.error("[Google] 로그인 에러:", e);
            this.showLoading(false);
          }
        },
      });

      // 사용자 클릭 직후 바로 요청(팝업 차단 회피에 유리)
      window.google.accounts.id.prompt();

    } catch (e) {
      console.error("[Google] SDK 로드/초기화 실패:", e);
      this.showLoading(false);
    }
  }

  async handleKakao() {
    // TODO: Kakao SDK → AuthService.loginWithKakao()
    this.scene.start("TitleScene");
  }
}
