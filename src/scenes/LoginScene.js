import Phaser from "phaser";
import AuthService from "../features/auth/service";
import appClient from "../core/appClient";
import TouchEffect from "../ui/TouchEffect";

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

    TouchEffect.init(this); // 터치 이펙트  
    this.cameras.main.fadeIn(30, 0, 0, 0); // 진입시 페이드인
    this.cameras.main.setBackgroundColor("#fffaee");

    // 이미지 (로고용, 임시 사각형)
    const logo = this.add.image(W * 0.5, H*0.2, "logo");
    logo.setDisplaySize(W*0.4, W*0.4);
    logo.setOrigin(0.5);

    this.loading = this.add.text(W*0.5, H*0.5, "로그인 중...", {
    fontSize: Math.round(H*0.02), color: "#333"
    }).setOrigin(0.5);

    // 버튼 컨테이너 (처음엔 숨김)
    this.btns = this.add.container().setVisible(false);

    const guestBtn = this.add.image(W*0.5, H*0.5, "게스트버튼").setScale(2).setOrigin(0.5).setInteractive({useHandCursor : true})
    .on("pointerdown", async () => {await this.handleGuest();});
    const orBar = this.add.text(W*0.5, H*0.72, "============= 또는 =============", {fontSize: Math.round(H*0.015), color: "#333"}).setOrigin(0.5);
    const kakaoBtn = this.add.image(W*0.5, H*0.8, "카카오버튼").setScale(2).setOrigin(0.5).setInteractive({useHandCursor : true})
    .on("pointerdown", async () => {await this.handleKakao();});
    const googleBtn = this.add.image(W*0.5, H*0.9, "구글버튼").setScale(2).setOrigin(0.5).setInteractive({useHandCursor : true})
    .on("pointerdown", async () => {await this.handleGoogle();});
    
    this.btns.add([guestBtn, orBar, kakaoBtn, googleBtn]);

    // 자동 흐름 시작
    this.tryAutoFlow();
  }
  showLoading(on){ this.loading.setVisible(on); this.btns.setVisible(!on); }

  async tryAutoFlow() {
    this.showLoading(true); // 일단 로딩중 띄움
    const hasRefresh = !!localStorage.getItem("refreshToken");
    console.log("[LoginScene] 자동 로그인 시도, 리프레시 토큰:", hasRefresh);
    // 1. 리프레시 있다면? => 재발급 시도
    if (hasRefresh) {
      const result = await appClient.ensureRefreshed();
      console.log("[LoginScene] 리프레시 결과:", result);
      if (result) return this.scene.start("ScenarioSelectScene");
      return this.showLoading(false);
    }
    // 2. 리프레시 없다면? => 게스트로 시작
    const {data, error} = await AuthService.startAsGuest();
    if (error || !data){
        console.error("[LoginScene] 게스트 로그인 실패:", error);
    } else {
        return this.scene.start("ScenarioSelectScene");
    }
    // 3. 게스트 시작도 실패하면 로그인버튼 세개 노출
    return this.showLoading(false);
  }

  async handleGuest() {
    this.showLoading(true);
    const {data, error} = await AuthService.startAsGuest();
    if (error || !data){
        console.error("[LoginScene] 게스트 로그인 실패:", error);
        this.showLoading(false);
    } else {
        return this.scene.start("ScenarioSelectScene");
    }
  }
  async handleGoogle() {
    this.scene.start("TitleScene");
  }
  async handleKakao() {
    this.scene.start("TitleScene");
  }
}
