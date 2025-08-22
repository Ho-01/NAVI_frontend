import Phaser from "phaser";
import AuthService from "../features/auth/service";
import appClient from "../core/appClient";

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoginScene" });
  }

  preload() {
    // 로딩할 자산을 여기에 추가
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.cameras.main.setBackgroundColor("#fffaee");

    this.loading = this.add.text(W*0.5, H*0.5, "로그인 중...", {
    fontSize: Math.round(H*0.04), color: "#333"
    }).setOrigin(0.5);

    // 버튼 컨테이너 (처음엔 숨김)
    this.btns = this.add.container(W*0.5, H*0.6).setVisible(false);

    // 버튼 3종(텍스트만, 심플)
    const mkBtn = (label, onClick, yOffset) => {
    const t = this.add.text(0, yOffset, label, {
    fontSize: Math.round(H*0.032), color: "#fff", backgroundColor: "#333",
    padding: { x: 24, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on("pointerdown", async () => { await onClick(); });
    return t;
    };

    const guestBtn = mkBtn("게스트로 진행", () => this.handleGuest(), 0);
    const kakaoBtn = mkBtn("카카오 로그인", () => this.handleKakao(), Math.round(H*0.07));
    const googleBtn = mkBtn("구글 로그인", () => this.handleGoogle(), Math.round(H*0.14));
    this.btns.add([guestBtn, kakaoBtn, googleBtn]);

    // 자동 흐름 시작
    this.tryAutoFlow();
  }
  showLoading(on){ this.loading.setVisible(on); this.btns.setVisible(!on); }

  async tryAutoFlow() {
    this.showLoading(true); // 일단 로딩중 띄움
    const hasRefresh = !!localStorage.getItem("refreshToken");

    // 1. 리프레시 있다면? => 재발급 시도
    if (hasRefresh) {
      const result = await appClient.ensureRefreshed();
      if (result) return this.scene.start("MainScene");
      return this.showLoading(false);
    }
    // 2. 리프레시 없다면? => 게스트로 시작
    const {data, error} = await AuthService.startAsGuest();
    if (error || !data){
        console.error("게스트 로그인 실패:", error);
    } else {
        return this.scene.start("MainScene");
    }
    // 3. 게스트 시작도 실패하면 로그인버튼 세개 노출
    return this.showLoading(false);
  }

  async handleGuest() {
    this.showLoading(true);
    // const g = await AuthService.startAsGuest();
    // if (g) return this.scene.start("MainScene");
    this.scene.start("MainScene");
    this.showLoading(false);
  }
  async handleGoogle() {
    this.scene.start("TitleScene");
  }
  async handleKakao() {
    this.scene.start("TitleScene");
  }
}
